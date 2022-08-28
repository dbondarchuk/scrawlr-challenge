<?php

namespace Tests;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;

use Laravel\Lumen\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Creates the application.
     *
     * @return \Laravel\Lumen\Application
     */
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';

        Artisan::call('cache:clear');

        return $app;
    }
}
