# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class FollowUpsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @follow_up = create(:follow_up)
        @organization_membership = @follow_up.organization_membership
        @user = @organization_membership.user
        @organization = @organization_membership.organization
      end

      context "#index" do
        setup do
          create(:follow_up, :shown, organization_membership: @organization_membership)
          @follow_up_shown_soon = create(:follow_up, show_at: @follow_up.show_at - 5.minutes, organization_membership: @organization_membership)
          @follow_up_shown_later = create(:follow_up, show_at: @follow_up.show_at + 5.minutes, organization_membership: @organization_membership)
        end

        test "org member can list follow ups" do
          sign_in @user

          assert_query_count 7 do
            get organization_follow_ups_path(@organization.slug)
          end

          assert_response :success
          assert_response_gen_schema
          assert_equal [@follow_up_shown_soon, @follow_up, @follow_up_shown_later].map(&:public_id), json_response["data"].pluck("id")
        end

        test "non-org member cannot list follow ups" do
          sign_in create(:user)
          get organization_follow_ups_path(@organization.slug)

          assert_response :forbidden
        end

        test "logged-out user cannot list follow ups" do
          get organization_follow_ups_path(@organization.slug)

          assert_response :unauthorized
        end

        test "different post authors mantains appropriate query count" do
          sign_in @user

          3.times do
            project = create(:project, organization: @organization)
            post = create(:post, organization: @organization, project: project)
            create(:follow_up, subject: post, organization_membership: @organization_membership)
          end
          3.times do
            project = create(:project, organization: @organization)
            child_post = create(:post, organization: @organization, parent: create(:post, organization: @organization), project: project)
            create(:follow_up, subject: child_post, organization_membership: @organization_membership)
          end

          3.times do
            project = create(:project, organization: @organization)
            integration_post = create(:post, :from_integration, organization: @organization, project: project)
            create(:follow_up, subject: integration_post, organization_membership: @organization_membership)
          end

          3.times do
            project = create(:project, organization: @organization)
            oauth_post = create(:post, :from_oauth_application, organization: @organization, project: project)
            create(:follow_up, subject: oauth_post, organization_membership: @organization_membership)
          end

          assert_query_count 9 do
            get organization_follow_ups_path(@organization.slug)
          end

          assert_response_gen_schema
          assert_response :ok
        end

        test "comment follow ups (on different post authors) mantains appropriate query count" do
          sign_in @user

          3.times do
            project = create(:project, organization: @organization)
            post = create(:post, organization: @organization, project: project)
            comment = create(:comment, subject: post)
            create(:follow_up, subject: comment, organization_membership: @organization_membership)
          end
          3.times do
            project = create(:project, organization: @organization)
            child_post = create(:post, organization: @organization, parent: create(:post, organization: @organization), project: project)
            comment = create(:comment, subject: child_post)
            create(:follow_up, subject: comment, organization_membership: @organization_membership)
          end

          3.times do
            project = create(:project, organization: @organization)
            integration_post = create(:post, :from_integration, organization: @organization, project: project)
            comment = create(:comment, subject: integration_post)
            create(:follow_up, subject: comment, organization_membership: @organization_membership)
          end

          3.times do
            project = create(:project, organization: @organization)
            oauth_post = create(:post, :from_oauth_application, organization: @organization, project: project)
            comment = create(:comment, subject: oauth_post)
            create(:follow_up, subject: comment, organization_membership: @organization_membership)
          end

          assert_query_count(11) do
            get organization_follow_ups_path(@organization.slug)
          end

          assert_response_gen_schema
          assert_response :ok
        end

        test "different comment authors maintains appropriate query count" do
          sign_in @user

          3.times do
            create(:comment, :from_integration)
            create(:comment, :from_oauth_application)
          end

          assert_query_count(7) do
            get organization_follow_ups_path(@organization.slug)
          end

          assert_response_gen_schema
          assert_response :ok
        end

        test "summary on follow up on self post is correct" do
          follow_up_member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          post = create(:post, organization: @organization, member: follow_up_member, project: project)

          sign_in(follow_up_member.user)
          create(:follow_up, subject: post, organization_membership: follow_up_member)

          get organization_follow_ups_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [
            { "text" => { "content" => "Your", "bold" => false } },
            { "text" => { "content" => " post in " } },
            { "text" => { "content" => project.name, "bold" => true } },
          ],
            json_response["data"][0]["summary_blocks"]
        end

        test "summary on follow up on other's post is correct" do
          follow_up_member = create(:organization_membership, organization: @organization)
          other_member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          post = create(:post, organization: @organization, member: other_member, project: project)

          sign_in(follow_up_member.user)
          create(:follow_up, subject: post, organization_membership: follow_up_member)

          get organization_follow_ups_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [
            { "text" => { "content" => "#{other_member.display_name}'s", "bold" => true } },
            { "text" => { "content" => " post in " } },
            { "text" => { "content" => project.name, "bold" => true } },
          ],
            json_response["data"][0]["summary_blocks"]
        end

        test "summary on follow up on self note is correct" do
          follow_up_member = create(:organization_membership, organization: @organization)
          note = create(:note, member: follow_up_member)

          sign_in(follow_up_member.user)
          create(:follow_up, subject: note, organization_membership: follow_up_member)

          get organization_follow_ups_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [
            { "text" => { "content" => "Your", "bold" => false } },
            { "text" => { "content" => " note: " } },
            { "text" => { "content" => note.title, "bold" => true } },
          ],
            json_response["data"][0]["summary_blocks"]
        end

        test "summary on follow up on other's note is correct" do
          follow_up_member = create(:organization_membership, organization: @organization)
          other_member = create(:organization_membership, organization: @organization)
          note = create(:note, member: other_member)

          sign_in(follow_up_member.user)
          create(:follow_up, subject: note, organization_membership: follow_up_member)

          get organization_follow_ups_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [
            { "text" => { "content" => "#{other_member.display_name}'s", "bold" => true } },
            { "text" => { "content" => " note: " } },
            { "text" => { "content" => note.title, "bold" => true } },
          ],
            json_response["data"][0]["summary_blocks"]
        end

        test "summary on follow up on self comment on self post is correct" do
          follow_up_member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          post = create(:post, organization: @organization, member: follow_up_member, project: project)
          comment = create(:comment, member: follow_up_member, subject: post)

          sign_in(follow_up_member.user)
          create(:follow_up, subject: comment, organization_membership: follow_up_member)

          get organization_follow_ups_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [
            { "text" => { "content" => "Your", "bold" => false } },
            { "text" => { "content" => " comment on " } },
            { "text" => { "content" => "your", "bold" => false } },
            { "text" => { "content" => " post" } },
          ],
            json_response["data"][0]["summary_blocks"]
        end

        test "summary on follow up on other comment on self post is correct" do
          follow_up_member = create(:organization_membership, organization: @organization)
          other_member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          post = create(:post, organization: @organization, member: follow_up_member, project: project)
          comment = create(:comment, member: other_member, subject: post)

          sign_in(follow_up_member.user)
          create(:follow_up, subject: comment, organization_membership: follow_up_member)

          get organization_follow_ups_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [
            { "text" => { "content" => "#{other_member.display_name}'s", "bold" => true } },
            { "text" => { "content" => " comment on " } },
            { "text" => { "content" => "your", "bold" => false } },
            { "text" => { "content" => " post" } },
          ],
            json_response["data"][0]["summary_blocks"]
        end

        test "summary on follow up on self comment on other post is correct" do
          follow_up_member = create(:organization_membership, organization: @organization)
          other_member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          post = create(:post, organization: @organization, member: other_member, project: project)
          comment = create(:comment, member: follow_up_member, subject: post)

          sign_in(follow_up_member.user)
          create(:follow_up, subject: comment, organization_membership: follow_up_member)

          get organization_follow_ups_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [
            { "text" => { "content" => "Your", "bold" => false } },
            { "text" => { "content" => " comment on " } },
            { "text" => { "content" => "#{other_member.display_name}'s", "bold" => true } },
            { "text" => { "content" => " post" } },
          ],
            json_response["data"][0]["summary_blocks"]
        end

        test "summary on follow up on other comment on other post is correct" do
          follow_up_member = create(:organization_membership, organization: @organization)
          other_member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          post = create(:post, organization: @organization, member: other_member, project: project)
          comment = create(:comment, member: other_member, subject: post)

          sign_in(follow_up_member.user)
          create(:follow_up, subject: comment, organization_membership: follow_up_member)

          get organization_follow_ups_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [
            { "text" => { "content" => "#{other_member.display_name}'s", "bold" => true } },
            { "text" => { "content" => " comment on " } },
            { "text" => { "content" => "#{other_member.display_name}'s", "bold" => true } },
            { "text" => { "content" => " post" } },
          ],
            json_response["data"][0]["summary_blocks"]
        end

        test "summary on follow up on integration post" do
          follow_up_member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          post = create(:post, :from_integration, organization: @organization, project: project)

          sign_in(follow_up_member.user)
          create(:follow_up, subject: post, organization_membership: follow_up_member)

          get organization_follow_ups_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [
            { "text" => { "content" => "Zapier's", "bold" => true } },
            { "text" => { "content" => " post in " } },
            { "text" => { "content" => project.name, "bold" => true } },
          ],
            json_response["data"][0]["summary_blocks"]
        end

        test "summary on follow up on oauth post" do
          follow_up_member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          post = create(:post, :from_oauth_application, organization: @organization, project: project)

          sign_in(follow_up_member.user)
          create(:follow_up, subject: post, organization_membership: follow_up_member)

          get organization_follow_ups_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [
            { "text" => { "content" => "Zapier's", "bold" => true } },
            { "text" => { "content" => " post in " } },
            { "text" => { "content" => project.name, "bold" => true } },
          ],
            json_response["data"][0]["summary_blocks"]
        end

        test "summary on follow up on call" do
          follow_up_member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          call = create(:call, room: create(:call_room, organization: @organization), project: project, title: "My important call", summary: "<p>Foobar</p>")
          create(:follow_up, subject: call, organization_membership: follow_up_member)

          sign_in follow_up_member.user
          get organization_follow_ups_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [
            { "text" => { "content" => call.title, "bold" => true } },
            { "text" => { "content" => " in " } },
            { "text" => { "content" => project.name, "bold" => true } },
          ],
            json_response["data"][0]["summary_blocks"]
          assert_equal "Foobar", json_response["data"][0].dig("subject", "body_preview")
        end
      end

      context "#update" do
        test "follow up owner can update follow up" do
          Timecop.freeze do
            Sidekiq::Queues.clear_all
            sign_in @user

            assert_query_count 15 do
              put organization_follow_up_path(@organization.slug, @follow_up.public_id),
                params: { show_at: 1.day.from_now }
            end

            assert_response :success
            assert_response_gen_schema
            assert_in_delta 1.day.from_now, Time.zone.parse(json_response["show_at"]), 2.seconds
            assert_enqueued_sidekiq_job(ShowFollowUpJob, args: [@follow_up.id], at: Time.zone.parse(json_response["show_at"]))
          end
        end

        test "non-owner cannot update follow up" do
          sign_in create(:organization_membership, organization: @organization).user

          put organization_follow_up_path(@organization.slug, @follow_up.public_id),
            params: { show_at: 1.day.from_now }

          assert_response :not_found
        end

        test "logged-out user cannot update follow up" do
          put organization_follow_up_path(@organization.slug, @follow_up.public_id),
            params: { show_at: 1.day.from_now }

          assert_response :unauthorized
        end
      end

      context "#destroy" do
        test "follow up owner can destroy follow up" do
          sign_in @user

          assert_query_count 8 do
            delete organization_follow_up_path(@organization.slug, @follow_up.public_id)
          end

          assert_response :no_content
          assert_not FollowUp.exists?(@follow_up.id)
        end

        test "non-owner cannot destroy follow up" do
          sign_in create(:organization_membership, organization: @organization).user
          delete organization_follow_up_path(@organization.slug, @follow_up.public_id)

          assert_response :not_found
        end

        test "logged-out user cannot destroy follow up" do
          delete organization_follow_up_path(@organization.slug, @follow_up.public_id)

          assert_response :unauthorized
        end
      end
    end
  end
end
