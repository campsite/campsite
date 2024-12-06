# frozen_string_literal: true

require "test_helper"

class MetaInspectorTest < ActiveSupport::TestCase
  test "GitHub repo" do
    VCR.use_cassette("meta_inspector/github_repo") do
      page = MetaInspector.new("https://github.com/flippercloud/flipper")

      assert_equal "GitHub - flippercloud/flipper: 🐬 Beautiful, performant feature flags for Ruby.", page.best_title
      assert_nil page.meta["twitter:image"]
      assert_equal "https://opengraph.githubassets.com/de57e677cf8b9630d8f48cb4a08b0ba1169f906237ddc9b266ff30eed9379093/flippercloud/flipper", page.meta["og:image"]
      assert_equal "https://github.githubassets.com/favicons/favicon.svg", page.images.favicon
    end
  end

  test "GitHub PR" do
    VCR.use_cassette("meta_inspector/github_pr") do
      page = MetaInspector.new("https://github.com/calcom/cal.com/pull/15339")

      assert_equal "revert: \"fix: 404 collisions (#15249)\" by zomars · Pull Request #15339 · calcom/cal.com", page.best_title
      assert_nil page.meta["twitter:image"]
      assert_equal "https://opengraph.githubassets.com/b97d24440076955ff1eb0348e82b570b24fd87301607e6839be13285bef019f1/calcom/cal.com/pull/15339", page.meta["og:image"]
      assert_equal "https://github.githubassets.com/favicons/favicon.svg", page.images.favicon
    end
  end

  test "unauthorized request" do
    VCR.use_cassette("meta_inspector/unauthorized_request") do
      page = MetaInspector.new("https://app.intercom.com/a/inbox/z9l4o9ru/inbox/shared/unassigned/conversation/91463")

      assert_equal "Intercom", page.best_title
      assert_nil page.meta["twitter:image"]
      assert_nil page.meta["og:image"]
      assert_equal "https://static.intercomassets.com/assets/favicon-c3a224b12ac68054e53b9e2f542ea4c96044661e1195f6b25f22e1e1cd24f198.png", page.images.favicon
    end
  end

  test "AWS changelog" do
    VCR.use_cassette("meta_inspector/aws_changelog") do
      page = MetaInspector.new("https://aws.amazon.com/about-aws/whats-new/2023/11/cost-optimization-hub")

      assert_equal "Introducing Cost Optimization Hub", page.best_title
      assert_equal "https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_179x109.png", page.meta["twitter:image"]
      assert_equal "https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png", page.meta["og:image"]
      assert_equal "https://a0.awsstatic.com/libra-css/images/site/fav/favicon.ico", page.images.favicon
    end
  end

  test "marketing site" do
    VCR.use_cassette("meta_inspector/marketing_site") do
      page = MetaInspector.new("https://multi.app")

      assert_equal "Multi— Multiplayer Collaboration for MacOS", page.best_title
      assert_equal "https://framerusercontent.com/images/1vHwr77193gnCsSk2stCCxibo.png", page.meta["twitter:image"]
      assert_equal "https://framerusercontent.com/images/1vHwr77193gnCsSk2stCCxibo.png", page.meta["og:image"]
      assert_equal "https://framerusercontent.com/images/oyE10bkzwR5El5hmPX8EDM6Bj4U.png", page.images.favicon
    end
  end

  test "news article" do
    VCR.use_cassette("meta_inspector/news_article") do
      page = MetaInspector.new("https://www.theverge.com/2024/5/29/24166341/apple-home-floor-plan-controller-for-homekit-app-launch-hands-on")

      assert_equal "This app put my Apple Home smart devices into an interactive map", page.best_title
      assert_nil page.meta["twitter:image"]
      assert_equal "https://cdn.vox-cdn.com/thumbor/v30tqDfCAwGYOF_uwlyWe1PK5es=/0x0:4137x2716/1200x628/filters:focal(2069x1358:2070x1359)/cdn.vox-cdn.com/uploads/chorus_asset/file/25467819/multiple_screens_high_resolution_overview_controller_7_0.PNG",
        page.meta["og:image"]
      assert_equal "https://www.theverge.com/icons/favicon.ico", page.images.favicon
    end
  end

  test "non-image favicon" do
    VCR.use_cassette("meta_inspector/non_image_favicon") do
      page = MetaInspector.new("https://www.nickholden.io")

      assert_equal "Nick Holden", page.best_title
      assert_nil page.meta["twitter:image"]
      assert_nil page.meta["og:image"]
      assert_nil page.images.favicon
    end
  end

  test "relative base href" do
    VCR.use_cassette("meta_inspector/relative_base_href") do
      page = MetaInspector.new("https://musicforprogramming.net/latest/")

      assert_nil page.best_title
      assert_nil page.meta["twitter:image"]
      assert_nil page.meta["og:image"]
      assert_equal "https://musicforprogramming.net/favicon.png", page.images.favicon
    end
  end
end
