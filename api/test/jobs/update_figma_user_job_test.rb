# frozen_string_literal: true

require "test_helper"

class UpdateFigmaUserJobTest < ActiveJob::TestCase
  setup do
    @user = create(:user)
    @integration = create(:integration, owner: @user, provider: :figma)
    @api_figma_user = Figma::User.new({
      "id" => "1234",
      "handle" => "josh",
      "img_url" => "https://s3-alpha.figma.com/profile/1234",
      "email" => "josh@campsite.com",
    })
    FigmaClient.any_instance.expects(:me).returns(@api_figma_user)
  end

  context "perform" do
    test "creates new FigmaUser record" do
      UpdateFigmaUserJob.new.perform(@integration.id)

      @user.reload
      assert_equal @api_figma_user.id, @user.figma_user.remote_user_id
      assert_equal @api_figma_user.handle, @user.figma_user.handle
      assert_equal @api_figma_user.email, @user.figma_user.email
      assert_equal @api_figma_user.img_url, @user.figma_user.img_url
    end

    test "updates existing FigmaUser record" do
      database_figma_user = create(:figma_user, user: @user, remote_user_id: @api_figma_user.id)

      UpdateFigmaUserJob.new.perform(@integration.id)

      database_figma_user.reload
      assert_equal @api_figma_user.id, database_figma_user.remote_user_id
      assert_equal @api_figma_user.handle, database_figma_user.handle
      assert_equal @api_figma_user.email, database_figma_user.email
      assert_equal @api_figma_user.img_url, database_figma_user.img_url
    end
  end
end
