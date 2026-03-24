<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    protected $fillable = ['subject_id', 'name', 'value', 'coefficient'];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
