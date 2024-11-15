-- Create user settings table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    notification_preferences JSONB NOT NULL DEFAULT '{
        "email": true,
        "push": false,
        "frequency": "daily",
        "types": {
            "journalReminders": true,
            "progressUpdates": true,
            "insights": true
        }
    }',
    theme_preferences JSONB NOT NULL DEFAULT '{
        "mode": "system",
        "fontSize": "medium"
    }',
    privacy_settings JSONB NOT NULL DEFAULT '{
        "shareProgress": false,
        "allowAnalytics": true,
        "dataRetention": {
            "journalEntries": 365,
            "metrics": 365
        }
    }',
    ai_interaction_settings JSONB NOT NULL DEFAULT '{
        "suggestionsEnabled": true,
        "reminderFrequency": "daily",
        "insightLevel": "detailed",
        "topicsOfInterest": ["personal-growth", "learning", "resilience"]
    }',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
