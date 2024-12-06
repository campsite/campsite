# frozen_string_literal: true

module Api
  module V1
    class UsersController < BaseController
      skip_before_action :require_authenticated_user, only: :me
      skip_before_action :require_authenticated_organization_membership, only: [:me, :update, :onboard, :send_email_confirmation, :avatar_presigned_fields, :cover_photo_presigned_fields]

      extend Apigen::Controller

      response model: CurrentUserSerializer, code: 200
      def me
        render_json(CurrentUserSerializer, current_user || User::NullUser.new)
      end

      response model: CurrentUserSerializer, code: 200
      request_params do
        {
          avatar_path: { type: :string, required: false, nullable: true },
          cover_photo_path: { type: :string, required: false, nullable: true },
          email: { type: :string, required: false },
          name: { type: :string, required: false },
          username: { type: :string, required: false },
          current_password: { type: :string, required: false },
          password: { type: :string, required: false },
          password_confirmation: { type: :string, required: false },
        }
      end
      def update
        if params.key?(:avatar_path)
          unless current_user.update(avatar_path: params[:avatar_path])
            render_unprocessable_entity(current_user)
            return
          end
        end

        if params.key?(:cover_photo_path)
          unless current_user.update(cover_photo_path: params[:cover_photo_path])
            render_unprocessable_entity(current_user)
            return
          end
        end

        if params[:email].present?
          if current_user.managed?
            return render_error(
              status: :unprocessable_entity,
              code: "unprocessable",
              message: "Your account is managed through google sign in, please reach out to support for assistance.",
            )
          end

          unless current_user.update(email: params[:email])
            render_unprocessable_entity(current_user)
            return
          end
        end

        if params[:username].present?
          unless current_user.update(username: params[:username])
            render_unprocessable_entity(current_user)
            return
          end
        end

        if params[:name].present?
          unless current_user.update(name: params[:name])
            render_unprocessable_entity(current_user)
            return
          end
        end

        if params[:password]
          if current_user.managed?
            return render_error(
              status: :unprocessable_entity,
              code: "unprocessable",
              message: "Your account is managed through google sign in, please reach out to support for assistance.",
            )
          end

          if current_user.update_with_password(params.permit(:current_password, :password, :password_confirmation))
            bypass_sign_in(current_user)
          else
            render_unprocessable_entity(current_user)
            return
          end
        end

        render_json(CurrentUserSerializer, current_user)
      end

      response model: CurrentUserSerializer, code: 200
      def onboard
        unless current_user.onboarded?
          current_user.update!(onboarded_at: Time.current)
        end

        render_json(CurrentUserSerializer, current_user)
      end

      response code: 204
      def send_email_confirmation
        unless current_user.confirmed?
          current_user.send_confirmation_instructions
        end
      end

      response model: PresignedPostFieldsSerializer, code: 200
      request_params do
        {
          mime_type: { type: :string },
        }
      end
      def avatar_presigned_fields
        presigned_fields = current_user.generate_avatar_presigned_post_fields(params[:mime_type])

        render_json(PresignedPostFieldsSerializer, presigned_fields)
      end

      response model: PresignedPostFieldsSerializer, code: 200
      request_params do
        {
          mime_type: { type: :string },
        }
      end
      def cover_photo_presigned_fields
        presigned_fields = current_user.generate_cover_photo_presigned_post_fields(params[:mime_type])

        render_json(PresignedPostFieldsSerializer, presigned_fields)
      end
    end
  end
end
