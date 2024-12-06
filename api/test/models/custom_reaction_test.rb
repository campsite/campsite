# frozen_string_literal: true

require "test_helper"

class CustomReactionTest < ActiveSupport::TestCase
  context "#name" do
    test "prevents name with less than 2 characters" do
      assert_invalid_name("")
      assert_invalid_name("c")
    end

    test "prevents name with more than 100 characters" do
      error = assert_invalid_name("a" * 101)

      assert_equal "Validation failed: Name should be less than 100 characters", error.message
    end

    test "prevents name with uppercase characters" do
      assert_invalid_name("Cat")
    end

    test "allows name with underscores" do
      assert_valid_name("party_blob")
    end

    test "allows name with hyphens" do
      assert_valid_name("party-blob")
    end

    test "prevents name with other punctuation marks" do
      ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "+", "=", "{", "}", "[", "]", "|", "\\", ":", ";", '"', "'", "<", ">", ",", ".", "?", "/", "🫠"].each do |char|
        error = assert_invalid_name("name#{char}")

        assert_equal "Validation failed: Name must be lowercase and can only contain limited punctuation marks", error.message
      end
    end

    test "prevents name that already exists as a system emoji" do
      organization = create(:organization)

      EmojiMart.ids.sample(10).each do |name|
        reaction = build(:custom_reaction, organization: organization, name: name)
        reaction.valid?
        assert_not reaction.errors[:name].blank?
      end
    end

    test "prevents multiple custom reactions with the same name in the same organization" do
      organization = create(:organization)

      assert_valid_name("party_blob", organization)
      error = assert_invalid_name("party_blob", organization)

      assert_equal "Validation failed: Name has already been taken", error.message
    end

    private

    def assert_valid_name(name, organization = create(:organization))
      assert_nothing_raised do
        create(:custom_reaction, organization: organization, name: name)
      end
    end

    def assert_invalid_name(name, organization = create(:organization))
      assert_raises(ActiveRecord::RecordInvalid) do
        create(:custom_reaction, organization: organization, name: name)
      end
    end
  end

  context "#destroy" do
    test "destroys associated reactions" do
      custom_reaction = create(:custom_reaction)
      reaction = create(:reaction, content: nil, custom_content: custom_reaction)

      custom_reaction.destroy!

      assert_raises(ActiveRecord::RecordNotFound) { reaction.reload }
    end
  end
end
