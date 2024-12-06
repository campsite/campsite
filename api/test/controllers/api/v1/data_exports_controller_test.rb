# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class DataExportCallbacksControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      context "#create" do
        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
        end

        test "queues a data export" do
          sign_in @member.user
          assert_difference -> { DataExport.count }, 1 do
            post organization_data_exports_path(@organization.slug)
          end

          assert_response :ok

          data_export = DataExport.last
          assert_equal @organization, data_export.subject
          assert_equal @member, data_export.member
          assert_enqueued_sidekiq_job DataExportJob, args: [data_export.id]
        end

        test "non admin cannot queue a data export" do
          @member.update!(role_name: :member)

          sign_in @member.user
          assert_difference -> { DataExport.count }, 0 do
            post organization_data_exports_path(@organization.slug)
          end

          assert_response :forbidden
        end

        test "non signed in user cannot queue a data export" do
          assert_difference -> { DataExport.count }, 0 do
            post organization_data_exports_path(@organization.slug)
          end

          assert_response :unauthorized
        end
      end
    end
  end
end
