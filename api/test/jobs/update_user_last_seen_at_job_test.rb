# frozen_string_literal: true

require "test_helper"

class UpdateUserLastSeenAtJobTest < ActiveJob::TestCase
  setup do
    @user = create(:user)
  end

  describe "#perform" do
    test "updates member's last_seen_at" do
      Timecop.freeze do
        users_stub = stub(push: nil)
        users_stub.expects(:push).with(@user)
        Userlist::Push.expects(:users).returns(users_stub)

        UpdateUserLastSeenAtJob.new.perform(@user.id)

        assert_in_delta Time.current, @user.reload.last_seen_at, 2.seconds
      end
    end
  end
end
