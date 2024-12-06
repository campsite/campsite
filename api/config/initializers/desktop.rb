# frozen_string_literal: true

require "middlewares/desktop_redirect_middleware"

Rails.configuration.middleware.use(Middlewares::DesktopRedirectMiddleware)
