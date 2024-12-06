# frozen_string_literal: true

module Api
  module V1
    module Digests
      class MigrationsController < V1::BaseController
        extend Apigen::Controller

        response model: PostDigestNoteMigrationSerializer, code: 200
        def show
          note = current_organization.notes.find_by(original_digest_id: current_digest.id)
          render_json(PostDigestNoteMigrationSerializer, { note_url: note&.url })
        end

        private

        def current_digest
          @current_digest ||= current_organization.post_digests.find_by!(public_id: params[:digest_id])
        end
      end
    end
  end
end
