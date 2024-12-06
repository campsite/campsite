# frozen_string_literal: true

module Devise
  module Strategies
    class TokenAuthenticatable < Authenticatable
      attr_accessor :token

      def valid_for_params_auth?
        return false unless params_auth_hash

        params_auth_hash[:email].present? &&
          params_auth_hash[:token].present? &&
          valid_params? &&
          with_authentication_hash(:params_auth, params_auth_hash)
      end

      def authenticate!
        resource = mapping.to.find_for_database_authentication(authentication_hash)
        resource&.unauthenticated_message = :token_invalid

        if validate(resource) { resource.valid_login_token?(token) }
          if resource.login_token_expired?
            fail!(:token_invalid)
          else
            remember_me(resource)
            success!(resource)
          end
        end

        unless resource
          Devise.paranoid ? raise(:token_invalid) : raise(:not_found_in_database)
        end
      end

      private

      # Sets the authentication hash and the token from params_auth_hash or http_auth_hash.
      def with_authentication_hash(auth_type, auth_values)
        self.authentication_hash = {}
        self.authentication_type = auth_type
        self.token = auth_values[:token]

        parse_authentication_key_values(auth_values, authentication_keys) &&
          parse_authentication_key_values(request_values, request_keys)
      end
    end
  end
end
