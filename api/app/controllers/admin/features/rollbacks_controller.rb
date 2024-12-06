# frozen_string_literal: true

module Admin
  module Features
    class RollbacksController < BaseController
      def create
        log.rollback_to!
        redirect_to(feature_path(feature_name))
      end

      private

      def log
        FlipperAuditLog.find(params[:log_id])
      end

      def feature_name
        params[:feature_name]
      end
    end
  end
end
