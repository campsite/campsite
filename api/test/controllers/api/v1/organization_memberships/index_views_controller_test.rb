# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module OrganizationMemberships
      class IndexViewsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
        end

        test "updates last_viewed_posts_at" do
          sign_in @member.user

          new_time = 10.minutes.ago

          put organization_membership_index_views_path(org_slug: @member.organization.slug), params: { last_viewed_posts_at: new_time }

          assert_response :success
          assert_equal new_time.to_i, @member.reload.last_viewed_posts_at.to_i
        end

        test "returns unauthorized if not signed in" do
          put organization_membership_index_views_path(org_slug: @member.organization.slug), params: { last_viewed_posts_at: 10.minutes.ago }

          assert_response :unauthorized
        end
      end
    end
  end
end
