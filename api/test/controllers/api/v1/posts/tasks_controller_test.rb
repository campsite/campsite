# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class TasksControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          html = <<~HTML.strip
              <ul class="task-list" data-type="taskList">
              <li class="task-item" data-checked="false" data-type="taskItem">
                <label><input type="checkbox"><span></span></label>
                <div><p>Unchecked</p></div>
              </li>
              <li class="task-item" data-checked="true" data-type="taskItem">
                <label><input type="checkbox" checked="checked"><span></span></label>
                <div><p>Checked</p></div>
              </li>
            </ul>
          HTML
          @post = create(:post, description_html: html)
          @organization = @post.organization
          @member = @post.member
          @other_member = create(:organization_membership, :member, organization: @organization)
        end

        context "#update" do
          test "post author can mark a task checked" do
            sign_in(@member.user)
            put organization_post_tasks_path(@organization.slug, @post.public_id), params: { index: 0, checked: true }, as: :json

            assert_response :ok
            assert_response_gen_schema

            doc = Nokogiri::HTML.fragment(@post.reload.description_html)

            assert_equal "true", doc.css("li")[0].attr("data-checked")
            assert_equal "checked", doc.css("input")[0].attr("checked")
          end

          test "post author can mark a task unchecked" do
            sign_in(@member.user)
            put organization_post_tasks_path(@organization.slug, @post.public_id), params: { index: 1, checked: false }, as: :json

            assert_response :ok
            assert_response_gen_schema

            doc = Nokogiri::HTML.fragment(@post.reload.description_html)

            assert_equal "false", doc.css("li")[1].attr("data-checked")
            assert_not_equal "checked", doc.css("input")[1].attr("checked")
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @member.user
            put organization_post_tasks_path(@organization.slug, post.public_id), params: { index: 0, checked: true }, as: :json

            assert_response :not_found
          end
        end
      end
    end
  end
end
