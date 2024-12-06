# frozen_string_literal: true

require "test_helper"

class FigmaPluginAccessTest < ActiveSupport::TestCase
  describe "figma plugin access" do
    it "allows certain routes" do
      assert FigmaPluginAccess.allowed?(controller: "api/v1/organizations", action: "index")
      assert FigmaPluginAccess.allowed?(controller: "api/v1/posts", action: "create")
      assert FigmaPluginAccess.allowed?(controller: "api/v1/projects", action: "index")
      assert FigmaPluginAccess.allowed?(controller: "api/v1/users", action: "me")
      assert FigmaPluginAccess.allowed?(controller: "api/v1/search/posts", action: "index")
    end
  end
end
