<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = ['semester_id', 'name', 'coefficient'];

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }
}
