<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resume_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');

            $table->string('status')->default('pending');
            $table->string('recruitment_status')->default('new');

            $table->unsignedTinyInteger('technical_score')->nullable();
            $table->unsignedTinyInteger('culture_score')->nullable();
            $table->text('summary')->nullable();
            $table->json('justification')->nullable();
            $table->json('raw_result')->nullable();
            $table->timestamps();
            $table->unique(['resume_id', 'role_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analyses');
    }
};
