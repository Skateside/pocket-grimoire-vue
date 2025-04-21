<?php

// https://medium.com/@khalidzeiter/building-a-simple-dependency-injection-container-in-php-db3a397283ae

class Container
{
    private array $bindings = [];

    public function set(string $id, callable $factory)
    {
        $this->bindings[$id] = $factory;
    }

    public function get(string $id)
    {
        if (!array_key_exists($id, $this->bindings)) {
            throw new \Exception("Target binding '{$id}' does not exist.");
        }

        $factory = $this->bindings[$id];

        return $factory($this);
    }

    public function build(string $class)
    {
        try {
            $reflector = new \ReflectorClass($class);
        } catch (\ReflectionException $e) {
            $message = sprintf(
                'Target class \'%s\' does not exist.',
                $class,
            );
            throw new \Exception($message, 0, $e);
        }

        // The type is not instantiable, such as an Interface or Abstract Class.
        if (!$reflector->isInstantiable()) {
            $message = sprintf(
                'Target class \'%s\' is not instantiable.',
                $class,
            );
            throw new \Exception($message);
        }

        $constructor = $reflector->getConstructor();

        // No constructor means no dependencies.
        if ($constructor === null) {
            return new $class;
        }

        $parameters = $constructor->getParameters();
        $dependencies = [];

        foreach ($parameters as $parameter) {
            $type = $parameter->getType();

            if (!($type instanceof \ReflectionNamedType) || $type->isBuiltin()) {
                // Resolve a non-class hinted primitive dependency.
                if ($parameter->isDefaultValueAvailable()) {
                    $dependencies[] = $parameter->getDefaultValue();
                } elseif ($parameter->isVariadic()) {
                    $dependencies[] = [];
                } else {
                    $message = sprintf(
                        'Unresolvable dependency \'%s\' in class \'%s\'',
                        $parameter,
                        $parameter->getDeclaringClass()->getName(),
                    );
                    throw new \Exception($message);
                }
            }

            $name = $type->getName();

            try {
                $dependency = $this->get($name);
                $dependencies[] = $dependency;
            } catch (\Exception $e) {
                if ($parameter->isOptional()) {
                    $dependencies[] = $parameter->getDefaultValue();
                } else {
                    $dependency = $this->build($parameter->getType()->getName());
                    $this->set($name, $dependency);
                    $dependencies[] = $dependency;
                }
            }
        }

        return $reflector->newInstanceArgs($dependencies);
    }

}

// Load .env files

class Env
{
    protected array $data = [];

    public function __constructor(
        $path,
        $suffixes = ['', '.local'],
        $name = '.env',
    ) {

        $files = array_map(function ($suffix) use ($path, $name) {
            return realpath($path . $name . $suffix);
        }, $suffixes);
        $this->load($files);

    }

    public function has(string $key)
    {
        return array_key_exists($key, $this->data);
    }

    public function get(string $key, $default = null)
    {
        return $this->has($key) ? $this->data[$key] : $default;
    }

    protected function load(array $files)
    {
        $this->data = array_merge(array_map(function ($file) {
            return $this->parseFile($file);
        }, $files));
    }

    protected function parseFile(string $file)
    {
        if (!file_exists($file)) {
            throw new \Exception("File '{$file}' does not exist.");
        }

        if (!is_readable($file)) {
            throw new \Exception("File '{$file}' is not readable.");
        }

        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $parsed = [];

        foreach ($lines as $line) {

            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);

            $paesed[$name] = $value;
        }

        return $parsed;
    }
}

// Create Database object

class Database
{
    public function __construct(
        string $dsn,
        string $username,
        #[\SensitiveParameter]
        string $password
    ) {
        return new \PDO($dsn, $username, $password);
    }
}

$container = new Container();
$container->set(Database::class, function () {
    $env = new Env(__DIR__ . '../');

    return new Database(
        $env->get('DATABASE_DSN'),
        $env->get('DATABASE_USERNAME'),
        $env->get('DATABASE_PASSWORD'),
    );
});


