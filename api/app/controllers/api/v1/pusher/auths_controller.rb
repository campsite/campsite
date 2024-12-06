# frozen_string_literal: true

module Api
  module V1
    module Pusher
      class AuthsController < BaseController
        class NotAuthorizedError < StandardError; end

        ORGANIZATION_CHANNEL_NAME_REGEX = /^presence-organization-(?<organization_slug>.*)$/
        THREAD_CHANNEL_NAME_REGEX = /^private-thread-(?<thread_id>.*)$/
        NOTE_CHANNEL_NAME_REGEX = /^presence-note-(?<note_id>.*)$/

        before_action :authorize
        skip_before_action :require_authenticated_user, only: :create
        skip_before_action :require_authenticated_organization_membership, only: :create

        rescue_from NotAuthorizedError, with: :render_forbidden

        def create
          response = ::Pusher.authenticate(params[:channel_name], params[:socket_id], user_id: current_user&.public_id)
          render(json: response)
        end

        private

        def authorize
          case params[:channel_name]
          when /^private-user-/
            return if current_user && current_user.channel_name == params[:channel_name]
          when /^private-figma-/
            return
          when /^private-thread-/
            thread_id = params[:channel_name].match(THREAD_CHANNEL_NAME_REGEX)[:thread_id]
            thread = MessageThread.find_by(public_id: thread_id)
            return if thread && Pundit.policy!(current_user, thread).show?
          when /^presence-note-/
            note_id = params[:channel_name].match(NOTE_CHANNEL_NAME_REGEX)[:note_id]
            return Note.viewable_by(current_user).exists?(public_id: note_id)
          when ORGANIZATION_CHANNEL_NAME_REGEX
            slug = params[:channel_name].match(ORGANIZATION_CHANNEL_NAME_REGEX)[:organization_slug]
            organization = Organization.find_by(slug: slug)
            return if organization&.member?(current_user)
          end

          raise NotAuthorizedError
        end
      end
    end
  end
end
