# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class DataExportCallbacksControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      context "#update" do
        test "completes data export" do
          data_export = create(:data_export)

          put data_export_callback_path(data_export.public_id, zip_path: "some/zip/path.zip")

          assert_response :ok

          assert_predicate data_export.reload, :completed?
          assert_not_nil data_export.completed_at
          assert_equal "some/zip/path.zip", data_export.zip_path
          assert_enqueued_email_with OrganizationMailer, :data_export_completed, args: [data_export]
          assert_enqueued_sidekiq_job DataExportCleanupJob, args: [data_export.id]
        end
      end
    end
  end
end
