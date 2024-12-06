# frozen_string_literal: true

require "test_helper"

class CustomReactionsPackTest < ActiveSupport::TestCase
  context "validations" do
    before do
      @organization = create(:organization)
      @name = "meows"
    end

    it "doesn't create a pack for an invalid name" do
      assert_raises(ActiveModel::ValidationError) do
        CustomReactionsPack.new(name: "alexandru").validate!
      end
    end

    it "doesn't create pack items for s3 directories" do
      S3_BUCKET.expects(:objects).with(prefix: "custom-reactions-packs/#{@name}")
        .returns([
          stub(key: "custom-reactions-packs/"),
          stub(key: "custom-reactions-packs/meows/"),
        ])

      pack = CustomReactionsPack.new(name: @name, organization: @organization)
      pack.validate!

      assert_equal 0, pack.items.size
      assert_not pack.installed?
    end

    it "marks the pack as installed if one reaction exists" do
      create(:custom_reaction, organization: @organization, pack: @name)
      S3_BUCKET.expects(:objects).with(prefix: "custom-reactions-packs/#{@name}")
        .returns([
          stub(key: "custom-reactions-packs/party-meow.png"),
        ])

      pack = CustomReactionsPack.new(name: @name, organization: @organization)
      pack.validate!

      assert_equal 1, pack.items.size
      assert_equal "party-meow", pack.items.first.name
      assert_equal "custom-reactions-packs/party-meow.png", pack.items.first.file_path
      assert_equal "image/png", pack.items.first.file_type
      assert_equal "http://campsite-test.imgix.net/custom-reactions-packs/party-meow.png", pack.items.first.file_url
      assert pack.installed?
    end

    it "infers file type from the file extension" do
      S3_BUCKET.expects(:objects).with(prefix: "custom-reactions-packs/#{@name}")
        .returns([
          stub(key: "custom-reactions-packs/party-meow.png"),
          stub(key: "custom-reactions-packs/raging-meow.gif"),
        ])

      pack = CustomReactionsPack.new(name: @name, organization: @organization)
      pack.validate!

      assert_equal 2, pack.items.size
      assert_equal "image/png", pack.items.first.file_type
      assert_equal "image/gif", pack.items.second.file_type
    end
  end

  context "install" do
    before do
      @organization = create(:organization)
      @organization_membership = create(:organization_membership, organization: @organization)
      @name = "meows"
    end

    it "installs the pack" do
      S3_BUCKET.expects(:objects).with(prefix: "custom-reactions-packs/#{@name}")
        .returns([
          stub(key: "custom-reactions-packs/party-meow.png"),
          stub(key: "custom-reactions-packs/raging-meow.gif"),
        ])

      assert_difference -> { @organization.custom_reactions.count }, 2 do
        CustomReactionsPack.install!(name: @name, organization: @organization, creator: @organization_membership)
      end

      assert CustomReactionsPack.new(name: @name, organization: @organization).installed?
      assert_equal 2, @organization.custom_reactions.count
      assert_equal "party-meow", @organization.custom_reactions.first.name
      assert_equal "raging-meow", @organization.custom_reactions.second.name
    end

    it "doesn't install the pack if it's already installed" do
      S3_BUCKET.expects(:objects).with(prefix: "custom-reactions-packs/#{@name}")
        .returns([
          stub(key: "custom-reactions-packs/party-meow.png"),
          stub(key: "custom-reactions-packs/raging-meow.gif"),
        ])

      assert_difference -> { @organization.custom_reactions.count }, 2 do
        CustomReactionsPack.install!(name: @name, organization: @organization, creator: @organization_membership)
      end

      assert CustomReactionsPack.new(name: @name, organization: @organization).installed?
      S3_BUCKET.expects(:objects).never

      assert_no_difference -> { @organization.custom_reactions.count } do
        CustomReactionsPack.install!(name: @name, organization: @organization, creator: @organization_membership)
      end
    end

    it "doesn't add reactions from pack if they already exist" do
      create(:custom_reaction, organization: @organization, name: "party-meow")
      create(:custom_reaction, organization: @organization, name: "raging-meow")
      S3_BUCKET.expects(:objects).with(prefix: "custom-reactions-packs/#{@name}")
        .returns([
          stub(key: "custom-reactions-packs/party-meow.png"),
          stub(key: "custom-reactions-packs/raging-meow.gif"),
        ])

      S3_BUCKET.expects(:objects).with(prefix: "custom-reactions-packs/#{@name}").never

      assert_no_difference -> { @organization.custom_reactions.count } do
        CustomReactionsPack.install!(name: @name, organization: @organization, creator: @organization_membership)
      end

      assert_not CustomReactionsPack.new(name: @name, organization: @organization).installed?
    end

    it "raises an error if the name is invalid" do
      assert_raises(ActiveModel::ValidationError) do
        CustomReactionsPack.install!(name: "alexandru", organization: @organization, creator: @organization_membership)
      end

      assert_equal 0, @organization.custom_reactions.count
    end
  end

  context "uninstall" do
    before do
      @organization = create(:organization)
      @organization_membership = create(:organization_membership, organization: @organization)
      @name = "meows"
    end

    it "uninstalls the pack" do
      S3_BUCKET.expects(:objects).with(prefix: "custom-reactions-packs/#{@name}")
        .returns([
          stub(key: "custom-reactions-packs/party-meow.png"),
          stub(key: "custom-reactions-packs/raging-meow.gif"),
        ])

      CustomReactionsPack.install!(name: @name, organization: @organization, creator: @organization_membership)

      assert CustomReactionsPack.new(name: @name, organization: @organization).installed?
      assert_equal 2, @organization.custom_reactions.count

      assert_difference -> { @organization.custom_reactions.count }, -2 do
        CustomReactionsPack.uninstall!(name: @name, organization: @organization)
      end

      assert_not CustomReactionsPack.new(name: @name, organization: @organization).installed?
      assert_equal 0, @organization.custom_reactions.count
    end

    it "no-ops if the pack is not installed" do
      S3_BUCKET.expects(:objects).never

      assert_no_difference -> { @organization.custom_reactions.count } do
        CustomReactionsPack.uninstall!(name: @name, organization: @organization)
      end
    end

    it "doesn't uninstall manually added reactions that conflict with packs" do
      user_custom_reaction = create(:custom_reaction, organization: @organization, name: "party-meow")
      S3_BUCKET.expects(:objects).with(prefix: "custom-reactions-packs/#{@name}")
        .returns([
          stub(key: "custom-reactions-packs/party-meow.png"),
          stub(key: "custom-reactions-packs/raging-meow.gif"),
        ])

      assert_difference -> { @organization.custom_reactions.count }, 1 do
        CustomReactionsPack.install!(name: @name, organization: @organization, creator: @organization_membership)
      end

      assert CustomReactionsPack.new(name: @name, organization: @organization).installed?

      assert_difference -> { @organization.custom_reactions.count }, -1 do
        CustomReactionsPack.uninstall!(name: @name, organization: @organization)
      end

      assert_equal 1, @organization.custom_reactions.count
      assert_equal user_custom_reaction, @organization.custom_reactions.first
    end

    it "raises an error if the name is invalid" do
      assert_raises(ActiveModel::ValidationError) do
        CustomReactionsPack.uninstall!(name: "alexandru", organization: @organization)
      end

      assert_equal 0, @organization.custom_reactions.count
    end
  end
end
