<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblSettings extends Model
{
    use HasFactory;

    protected $table = 'tbl_settings';
    protected $primaryKey = 'id_setting';

    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
    ];

    /**
     * Get setting value by key
     */
    public static function getValue($key, $default = null)
    {
        try {
            $setting = self::where('key', $key)->first();
            
            if (!$setting) {
                return $default;
            }

            switch ($setting->type) {
                case 'boolean':
                    // Handle boolean: '1', 'true', 'on', 'yes' = true; '0', 'false', 'off', 'no' = false
                    $value = strtolower(trim($setting->value));
                    return in_array($value, ['1', 'true', 'on', 'yes']);
                case 'integer':
                    return (int) $setting->value;
                case 'json':
                    return json_decode($setting->value, true);
                default:
                    return $setting->value;
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in TblSettings::getValue: ' . $e->getMessage());
            return $default;
        }
    }

    /**
     * Set setting value by key
     */
    public static function setValue($key, $value, $type = 'string', $description = null)
    {
        try {
            $setting = self::where('key', $key)->first();
            
            if ($setting) {
                $setting->value = is_bool($value) ? ($value ? '1' : '0') : (string) $value;
                $setting->type = $type;
                if ($description) {
                    $setting->description = $description;
                }
                $setting->save();
            } else {
                self::create([
                    'key' => $key,
                    'value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value,
                    'type' => $type,
                    'description' => $description,
                ]);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error in TblSettings::setValue: ' . $e->getMessage());
            throw $e;
        }
    }
}
