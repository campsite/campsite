# frozen_string_literal: true

class CurrentUserSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :avatar_url
  api_association :avatar_urls, blueprint: AvatarUrlsSerializer
  api_field :cover_photo_url, nullable: true
  api_field :email
  api_field :username
  api_field :display_name

  api_field :onboarded_at, nullable: true
  api_field :channel_name
  api_field :unconfirmed_email, nullable: true
  api_field :created_at, nullable: true

  api_field :preferred_timezone, name: :timezone, nullable: true
  api_field :confirmed?, name: :email_confirmed, type: :boolean
  api_field :managed?, name: :managed, type: :boolean
  api_field :otp_enabled?, name: :two_factor_enabled, type: :boolean, nullable: true
  api_field :staff?, name: :staff, type: :boolean
  api_field :system?, name: :system, type: :boolean
  api_field :integration?, name: :integration, type: :boolean
  api_field :on_call?, name: :on_call, type: :boolean
  api_field :notifications_paused?, name: :notifications_paused, type: :boolean
  api_field :notification_pause_expires_at, nullable: true
  api_field :enabled_frontend_features, name: :features, is_array: true, enum: User::FRONTEND_FEATURES
  api_field :logged_in, type: :boolean do |user|
    !user.is_a?(User::NullUser)
  end

  api_field :preferences, blueprint: UserPreferencesSerializer do |user|
    user.preferences.each_with_object({}) do |preference, preferences|
      preferences[preference.key] = preference.value
    end
  end
end
