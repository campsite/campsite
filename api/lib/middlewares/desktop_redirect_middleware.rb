# frozen_string_literal: true

module Middlewares
  class DesktopRedirectMiddleware
    include Rails.application.routes.url_helpers

    # Detect the most common assets.
    ASSETS_REGEX =
      /\.(css|png|jpe?g|gif|js|svg|ico|flv|mov|m4v|ogg|swf)\z/i

    # Detect the ACCEPT header. IE8 send */*.
    ACCEPT_REGEX = %r{(text/html|\*/\*)}

    def initialize(app)
      @app = app
    end

    def call(env)
      request = Rack::Request.new(env)

      # Only apply verification on HTML requests.
      # This ensures that images, CSS and JavaScript
      # will be rendered.
      return run_app(env) unless process?(request)

      if redirect?(request)
        resolve_redirection(env, request.path, new_desktop_session_path)
      else
        run_app(env)
      end
    end

    def redirect?(request)
      desktop_redirectable = request.get? &&
        request.host.starts_with?("auth") &&
        [auth_root_path, new_user_session_path, new_user_registration_path].include?(request.path)

      # redirect /sign-in or /sign-up requests from the desktop app to /sign-in/desktop
      desktop_redirectable && request.user_agent&.match(ProductLogsJob::CAMPSITE_UA_REGEX)
    end

    def resolve_redirection(env, current_path, path)
      uri = URI.parse(path)

      if uri.path == current_path
        run_app(env)
      else
        [302, { "Content-Type" => "text/html", "Location" => path }, []]
      end
    end

    def run_app(env)
      @app.call(env)
    end

    def process?(request)
      html?(request) && !assets?(request)
    end

    def html?(request)
      request.env["HTTP_ACCEPT"].to_s.match(ACCEPT_REGEX)
    end

    def assets?(request)
      request.path.match(ASSETS_REGEX)
    end
  end
end
