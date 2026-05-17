<?php

namespace Tests\Feature;

use App\Models\Grade;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\User;
use App\Models\Year;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GradeManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    // --- Years ---

    public function test_user_can_create_year(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/years', ['name' => '2024-2025']);

        $response->assertStatus(201)->assertJsonFragment(['name' => '2024-2025']);
        $this->assertDatabaseHas('years', ['name' => '2024-2025', 'user_id' => $this->user->id]);
    }

    public function test_user_can_list_own_years(): void
    {
        Year::factory()->create(['user_id' => $this->user->id, 'name' => 'Mon année']);
        Year::factory()->create(['user_id' => User::factory()->create()->id, 'name' => 'Autre utilisateur']);

        $response = $this->actingAs($this->user, 'api')->getJson('/api/years');

        $response->assertStatus(200)->assertJsonCount(1);
    }

    public function test_user_cannot_delete_another_users_year(): void
    {
        $other = User::factory()->create();
        $year  = Year::factory()->create(['user_id' => $other->id]);

        $this->actingAs($this->user, 'api')
            ->deleteJson("/api/years/{$year->id}")
            ->assertStatus(404);
    }

    public function test_deleting_year_cascades_to_semesters(): void
    {
        $year     = Year::factory()->create(['user_id' => $this->user->id]);
        $semester = Semester::factory()->create(['year_id' => $year->id]);

        $this->actingAs($this->user, 'api')->deleteJson("/api/years/{$year->id}")->assertStatus(200);

        $this->assertDatabaseMissing('semesters', ['id' => $semester->id]);
    }

    // --- Semesters ---

    public function test_user_can_create_semester(): void
    {
        $year = Year::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/years/{$year->id}/semesters", ['name' => 'Semestre 1']);

        $response->assertStatus(201)->assertJsonFragment(['name' => 'Semestre 1']);
    }

    // --- Subjects ---

    public function test_user_can_create_subject_with_coefficient(): void
    {
        $year     = Year::factory()->create(['user_id' => $this->user->id]);
        $semester = Semester::factory()->create(['year_id' => $year->id]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/semesters/{$semester->id}/subjects", [
                'name'        => 'Mathématiques',
                'coefficient' => 3,
            ]);

        $response->assertStatus(201)->assertJsonFragment(['name' => 'Mathématiques'])->assertJsonPath('coefficient', 3);
    }

    public function test_user_can_update_subject_coefficient(): void
    {
        $year     = Year::factory()->create(['user_id' => $this->user->id]);
        $semester = Semester::factory()->create(['year_id' => $year->id]);
        $subject  = Subject::factory()->create(['semester_id' => $semester->id, 'coefficient' => 1]);

        $response = $this->actingAs($this->user, 'api')
            ->patchJson("/api/subjects/{$subject->id}", ['coefficient' => 4]);

        $response->assertStatus(200)->assertJsonPath('coefficient', 4);
    }

    // --- Grades ---

    public function test_user_can_create_grade(): void
    {
        $year     = Year::factory()->create(['user_id' => $this->user->id]);
        $semester = Semester::factory()->create(['year_id' => $year->id]);
        $subject  = Subject::factory()->create(['semester_id' => $semester->id]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/subjects/{$subject->id}/grades", [
                'name'        => 'DS1',
                'value'       => 15.5,
                'coefficient' => 2,
            ]);

        $response->assertStatus(201)->assertJsonFragment(['name' => 'DS1'])->assertJsonPath('value', 15.5);
    }

    public function test_grade_value_must_be_between_0_and_20(): void
    {
        $year     = Year::factory()->create(['user_id' => $this->user->id]);
        $semester = Semester::factory()->create(['year_id' => $year->id]);
        $subject  = Subject::factory()->create(['semester_id' => $semester->id]);

        $this->actingAs($this->user, 'api')
            ->postJson("/api/subjects/{$subject->id}/grades", [
                'name'  => 'DS1',
                'value' => 25,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['value']);
    }

    public function test_user_can_update_grade(): void
    {
        $year     = Year::factory()->create(['user_id' => $this->user->id]);
        $semester = Semester::factory()->create(['year_id' => $year->id]);
        $subject  = Subject::factory()->create(['semester_id' => $semester->id]);
        $grade    = Grade::factory()->create(['subject_id' => $subject->id, 'value' => 10]);

        $response = $this->actingAs($this->user, 'api')
            ->patchJson("/api/grades/{$grade->id}", ['value' => 18, 'coefficient' => 1]);

        $response->assertStatus(200)->assertJsonPath('value', 18);
    }

    public function test_user_cannot_access_another_users_grades(): void
    {
        $other   = User::factory()->create();
        $year    = Year::factory()->create(['user_id' => $other->id]);
        $sem     = Semester::factory()->create(['year_id' => $year->id]);
        $subject = Subject::factory()->create(['semester_id' => $sem->id]);

        $this->actingAs($this->user, 'api')
            ->getJson("/api/subjects/{$subject->id}/grades")
            ->assertStatus(404);
    }
}
