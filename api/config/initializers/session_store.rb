# frozen_string_literal: true

Rails.application.config.session_store(
  :cookie_store,
  key: "_campsite_api_session",
  domain: :all,
  same_site: :lax,
  expire_after: 1.month,
  secure: Rails.env.production?,
)
