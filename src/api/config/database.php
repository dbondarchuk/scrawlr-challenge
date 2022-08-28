<?php declare(strict_types = 1);

/**
 * ! DO NOT MOVE OR RENAME THIS FILE
 *
 * PACKAGE CONFIG - Laravel/Lumen
 *
 * Laravel/Lumen default database configuration values.
 */

return [

    /**
     * Default Database Connection Name
     *
     * Accepted Values: [pgsql]
     */
    'default' => env('DB_CONNECTION', 'pgsql'),

    /**
     * Each of the Filesystem Disks available.
     * Supported Drivers: [sqlite, mysql, pgsql, sqlsrv]
     */
    'connections' => [
        'pgsql' => [
            'driver' => 'pgsql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', 5_432),
            'database' => env('DB_DATABASE', 'forge'),
            'username' => env('DB_USERNAME', 'forge'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => env('DB_CHARSET', 'utf8'),
            'prefix' => env('DB_PREFIX', ''),
            'schema' => env('DB_SCHEMA', 'public'),
            'sslmode' => env('DB_SSL_MODE', 'prefer'),
            'dump' => [
                // 5 minute timeout
                'timeout' => (60 * 10),
            ],
        ],
        'testing' => [
            'driver'   => 'sqlite',
            'database' => ':memory:',
            'prefix'   => '',
        ],
    ],

    /**
     * This table keeps track of all the migrations that have already run for
     * your application. Using this information, we can determine which of
     * the migrations on disk haven't actually been run in the database.
     */
    'migrations' => '_infra_migrations',

    /**
     * Each of the redis connections available
     * with the configuration values that should be used.
     */
    // 'redis' => [
    //     'client' => env('REDIS_CLIENT', 'phpredis'),

    //     'default' => [
    //         'host' => env('REDIS_HOST', '127.0.0.1'),
    //         'password' => env('REDIS_PASSWORD', null),
    //         'port' => env('REDIS_PORT', 6_379),
    //         'database' => env('REDIS_DB', 0),
    //     ],

    //     'cache' => [
    //         'host' => env('REDIS_HOST', '127.0.0.1'),
    //         'password' => env('REDIS_PASSWORD', null),
    //         'port' => env('REDIS_PORT', 6_379),
    //         'database' => env('REDIS_CACHE_DB', 1),
    //     ],
    // ],
];
