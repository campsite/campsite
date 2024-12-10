# frozen_string_literal: true

require "test_helper"

module Admin
  module Features
    class ActorsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        host! "admin.campsite.com"
        @staff = create(:user, :staff)
      end

      context "#destroy" do
        test "it disables a flag for an actor" do
          user = create(:user)
          feature_name = "my_cool_feature"
          Flipper.enable(feature_name, user)

          sign_in(@staff)
          delete feature_actor_path(feature_name, user.flipper_id)

          assert_response :redirect
          assert_equal "Disabled #{feature_name} for #{user.flipper_id}", flash[:notice]
          assert_not Flipper.enabled?(feature_name, user)
        end
      end
    end
  end
end
