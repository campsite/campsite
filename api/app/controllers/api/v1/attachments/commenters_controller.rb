# frozen_string_literal: true

module Api
  module V1
    module Attachments
      class CommentersController < BaseController
        extend Apigen::Controller

        after_action :verify_authorized

        response model: OrganizationMemberSerializer, is_array: true, code: 200
        def index
          authorize(current_organization, :show_attachments?)
          commenters = Attachment.latest_commenters(params[:attachment_id])
          render_json(OrganizationMemberSerializer, commenters)
        end
      end
    end
  end
end
