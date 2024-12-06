# frozen_string_literal: true

require "test_helper"

class TagTest < ActiveSupport::TestCase
  describe "validations" do
    test "is valid" do
      tag = build(:tag, name: "aa")
      assert_predicate tag, :valid?

      tag = build(:tag, name: "a-a")
      assert_predicate tag, :valid?
    end

    test "is invalid for a alphanumeric character containing symbols other than a dash" do
      tag = build(:tag, name: "_a_")
      assert_not_predicate tag, :valid?

      tag = build(:tag, name: "*a*")
      assert_not_predicate tag, :valid?

      tag = build(:tag, name: ".a.")
      assert_not_predicate tag, :valid?

      tag = build(:tag, name: "a")
      assert_not_predicate tag, :valid?

      tag = build(:tag, name: "-a")
      assert_not_predicate tag, :valid?
    end

    test "is invalid for an org with the existing tag name" do
      existing_tag = create(:tag, name: "existing")
      tag = build(:tag, name: "existing", organization: existing_tag.organization)

      assert_not_predicate tag, :valid?
      assert_equal ["Name has already been taken"], tag.errors.full_messages
    end

    test "is invalid if tag name is longer than 32 characters" do
      tag = build(:tag, name: "a" * 33)

      assert_not_predicate tag, :valid?
      assert_equal ["Name should be less than 32 characters."], tag.errors.full_messages
    end
  end
end
