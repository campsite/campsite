# frozen_string_literal: true

module Api
  module V1
    module Users
      class EditorSyncTokensController < V1::BaseController
        extend Apigen::Controller

        skip_before_action :require_authenticated_organization_membership, only: :create

        response code: 201 do
          { token: { type: :string } }
        end
        def create
          authorize(current_user, :create_editor_sync?)

          # very basic token generation
          app = current_user.oauth_applications.find_or_create_by(
            name: "editor-sync",
            provider: :editor_sync,
            redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
            confidential: true,
            scopes: "read_organization write_post",
          )

          access_token = app.access_tokens.build(
            resource_owner: current_user,
            expires_in: 1.hour.to_i,
            scopes: app.scopes,
          )
          access_token.use_refresh_token = true
          access_token.save!

          render(json: { token: access_token.plaintext_token }, status: :created)
        end
      end
    end
  end
end
