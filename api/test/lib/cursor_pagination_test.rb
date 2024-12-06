# frozen_string_literal: true

require "test_helper"

class CursorPaginationTest < ActiveSupport::TestCase
  setup do
    @first_user = create(:user, created_at: 10.minutes.ago)
    @second_user = create(:user, created_at: 8.minutes.ago)
    @third_user = create(:user, created_at: 6.minutes.ago)
    @fourth_user = create(:user)
  end

  context "#run" do
    test "returns values if no option is provided" do
      pagination = CursorPagination.new(scope: User.all).run
      assert_equal 4, pagination.results.length
    end

    context "with order=:asc" do
      test "returns sorted values after the cursor" do
        pagination = CursorPagination.new(scope: User.all, after: @second_user.public_id, order: :asc).run
        users = pagination.results

        assert_equal 2, users.length
        assert_equal @third_user, users[0]
        assert_equal @fourth_user, users[1]
      end

      test "returns sorted values before the cursor" do
        pagination = CursorPagination.new(scope: User.all, before: @fourth_user.public_id, order: :asc).run
        users = pagination.results

        assert_equal 3, users.length
        assert_equal @first_user, users[0]
        assert_equal @second_user, users[1]
        assert_equal @third_user, users[2]
      end
    end

    context "with order=:desc" do
      test "returns sorted values after the cursor" do
        pagination = CursorPagination.new(scope: User.all, after: @third_user.public_id, order: :desc).run
        users = pagination.results

        assert_equal 2, users.length
        assert_equal @second_user, users[0]
        assert_equal @first_user, users[1]
      end

      test "returns sorted values before the cursor" do
        pagination = CursorPagination.new(scope: User.all, before: @second_user.public_id, order: :desc).run
        users = pagination.results

        assert_equal 2, users.length
        assert_equal @fourth_user, users[0]
        assert_equal @third_user, users[1]
      end

      test "with two order columns" do
        old_albus = create(:user, name: "Albus", created_at: 1.month.ago)
        ron = create(:user, name: "Ron", created_at: 1.day.ago)
        new_albus = create(:user, name: "Albus", created_at: 1.day.ago)
        ids = [old_albus, ron, new_albus].map(&:id)

        pagination_without_cursor = CursorPagination.new(scope: User.where(id: ids), order: { name: :asc, created_at: :desc }).run
        users = pagination_without_cursor.results

        assert_equal [new_albus, old_albus, ron], users

        pagination_with_cursor = CursorPagination.new(scope: User.where(id: ids), order: { name: :asc, created_at: :desc }, after: new_albus.public_id).run
        users = pagination_with_cursor.results

        assert_equal [old_albus, ron], users
      end

      test "with three order columns" do
        old_onboarded_albus = create(:user, name: "Albus", created_at: 1.month.ago, onboarded_at: 1.month.ago)
        old_albus = create(:user, name: "Albus", created_at: 1.month.ago, onboarded_at: nil)
        ron = create(:user, name: "Ron", created_at: 1.day.ago, onboarded_at: nil)
        new_albus = create(:user, name: "Albus", created_at: 1.day.ago, onboarded_at: nil)
        ids = [old_onboarded_albus, old_albus, ron, new_albus].map(&:id)

        pagination_without_cursor = CursorPagination.new(scope: User.where(id: ids), order: { name: :asc, created_at: :desc, onboarded_at: :desc }).run
        users = pagination_without_cursor.results

        assert_equal [new_albus, old_albus, old_onboarded_albus, ron], users

        pagination_with_cursor = CursorPagination.new(scope: User.where(id: ids), order: { name: :asc, created_at: :desc, onboarded_at: :desc }, after: new_albus.public_id).run
        users = pagination_with_cursor.results

        assert_equal [old_albus, old_onboarded_albus, ron], users
      end

      test "includes other record with same sort value as last record on next page" do
        albus_1 = create(:user, name: "Albus")
        albus_2 = create(:user, name: "Albus")
        ids = [albus_1, albus_2].map(&:id)

        pagination = CursorPagination.new(scope: User.where(id: ids), order: { name: :asc }, after: albus_1.public_id).run
        users = pagination.results

        assert_equal [albus_2], users
      end
    end
  end

  context "#next_cursor" do
    test "returns the public_id for the last item in the cursor" do
      pagination = CursorPagination.new(scope: User.all, after: @first_user.public_id, limit: 2).run

      assert_equal pagination.next_cursor, pagination.results.last.public_id
    end

    test "returns nil if cursor is empty" do
      pagination = CursorPagination.new(scope: User.all, after: @fourth_user.public_id).run

      assert_nil pagination.next_cursor
    end

    test "returns nil if  no more items" do
      pagination = CursorPagination.new(scope: User.all, after: @first_user.public_id, limit: 4).run

      assert_nil pagination.next_cursor
    end
  end

  context "#prev_cursor" do
    test "returns the public_id for the first item in the cursor" do
      pagination = CursorPagination.new(scope: User.all, before: @fourth_user.public_id, limit: 2).run

      assert_equal pagination.prev_cursor, pagination.results.first.public_id
    end

    test "returns nil if cursor is empty" do
      pagination = CursorPagination.new(scope: User.all, before: @first_user.public_id).run

      assert_nil pagination.prev_cursor
    end

    test "returns the public_id for the first item in the cursor" do
      pagination = CursorPagination.new(scope: User.all, before: @fourth_user.public_id, limit: 4).run

      assert_nil pagination.prev_cursor
    end
  end

  context "#total_count" do
    test "returns the total count of the scope" do
      pagination = CursorPagination.new(scope: User.all)
      assert_equal 4, pagination.total_count
    end
  end
end
