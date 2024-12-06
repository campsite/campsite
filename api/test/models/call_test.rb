# frozen_string_literal: true

require "test_helper"

class CallTest < ActiveSupport::TestCase
  context ".scoped_search" do
    def setup
      Searchkick.enable_callbacks
      @thread = create(:message_thread, :dm)
      @member = @thread.organization_memberships.first
      @org = @member.organization
      @call_room = create(:call_room, subject: @thread)
      @title = "My important meeting"
      @summary = "In this meeting, we discussed milk"
      @transcription_vtt = "Gotta go refill my cup of milk."
      @call = create(:call, room: @call_room, title: @title, summary: @summary)
      @peer = create(:call_peer, call: @call, organization_membership: @member)
      @recording = create(:call_recording, call: @call, transcription_vtt: @transcription_vtt)
      Call.search_index.refresh
    end

    def teardown
      Searchkick.disable_callbacks
    end

    test "search title" do
      results = Call.scoped_search(query: @title, organization: @org)
      calls = Pundit.policy_scope!(@member.user, Call.where(id: results.pluck(:id)))

      assert_equal 1, calls.count
      assert_equal @call.public_id, calls.first.public_id
    end

    test "search summary" do
      results = Call.scoped_search(query: @summary, organization: @org)
      calls = Pundit.policy_scope!(@member.user, Call.where(id: results.pluck(:id)))

      assert_equal 1, calls.count
      assert_equal @call.public_id, calls.first.public_id
    end

    test "search transcript" do
      results = Call.scoped_search(query: @transcription_vtt, organization: @org)
      calls = Pundit.policy_scope!(@member.user, Call.where(id: results.pluck(:id)))

      assert_equal 1, calls.count
      assert_equal @call.public_id, results.first.public_id
    end

    test "does not match other orgs" do
      results = Call.scoped_search(query: @title, organization: create(:organization))

      assert_equal 0, results.count
    end

    test "does not match calls without recordings" do
      @call.recordings.destroy_all
      Call.search_index.refresh

      results = Call.scoped_search(query: @title, organization: @org)

      assert_equal 0, results.count
    end

    test "includes calls the user attended, even if they aren't in the thread" do
      @thread.memberships.find_by(organization_membership: @member).destroy!

      results = Call.scoped_search(query: @title, organization: @org)
      calls = Pundit.policy_scope!(@member.user, Call.where(id: results.pluck(:id)))

      assert_equal 1, calls.count
      assert_equal @call.public_id, calls.first.public_id
    end

    test "includes calls in threads the user is a member of, even if they didn't attend the call" do
      @peer.destroy!

      results = Call.scoped_search(query: @title, organization: @org)
      calls = Pundit.policy_scope!(@member.user, Call.where(id: results.pluck(:id)))

      assert_equal 1, calls.count
      assert_equal @call.public_id, calls.first.public_id
    end

    test "does not match calls the user shouldn't have access to" do
      @thread.memberships.find_by(organization_membership: @member).destroy!
      @peer.destroy!

      results = Call.scoped_search(query: @title, organization: @org)
      calls = Pundit.policy_scope!(@member.user, Call.where(id: results.pluck(:id)))

      assert_equal 0, calls.count
    end

    test "works when there are no calls" do
      Call.destroy_all
      Call.reindex

      results = Call.scoped_search(query: @title, organization: @org)

      assert_equal 0, results.count
    end
  end

  context "#formatted_transcript" do
    test "it strips transcript data from VTT" do
      vtt = <<~VTT
        WEBVTT

        00:00:00.000 --> 00:00:01.000
        Foo Bar: Hello World


      VTT
      recording = create(:call_recording, :with_transcription, transcription_vtt: vtt)
      result = recording.call.formatted_transcript
      assert_equal "Foo Bar: Hello World", result
    end

    test "it merges multiple recordings" do
      vtt1 = <<~VTT
        WEBVTT

        00:00:00.000 --> 00:00:01.000
        Foo Bar: Hello World


      VTT
      vtt2 = <<~VTT
        WEBVTT

        00:01:02.000 --> 00:03:04.000
        Cat Dog: Woof woof


      VTT
      call = create(:call)
      call.update!(recordings: [
        create(:call_recording, :with_transcription, call: call, transcription_vtt: vtt1),
        create(:call_recording, :with_transcription, call: call, transcription_vtt: vtt2),
      ])
      result = call.formatted_transcript
      assert_equal "Foo Bar: Hello World\nCat Dog: Woof woof", result
    end
  end

  context ".viewable_by" do
    test "member can view call in private project they belong to" do
      member = create(:organization_membership, :member)
      project = create(:project, :private, organization: member.organization)
      project.add_member!(member)
      call = create(:call, project: project)

      assert_equal [call], Call.viewable_by(member.user)
    end

    test "member can't view call in private project they don't belong to" do
      member = create(:organization_membership, :member)
      project = create(:project, :private, organization: member.organization)
      create(:call, project: project)

      assert_predicate Call.viewable_by(member.user), :none?
    end

    test "member can view call in open project they don't belong to" do
      member = create(:organization_membership, :member)
      project = create(:project, organization: member.organization)
      call = create(:call, project: project)

      assert_equal [call], Call.viewable_by(member.user)
    end

    test "guest can view call in open project they belong to" do
      guest_member = create(:organization_membership, :guest)
      project = create(:project, organization: guest_member.organization)
      project.add_member!(guest_member)
      call = create(:call, project: project)

      assert_equal [call], Call.viewable_by(guest_member.user)
    end

    test "guest can't view call in open project they don't belong to" do
      guest_member = create(:organization_membership, :guest)
      project = create(:project, organization: guest_member.organization)
      create(:call, project: project)

      assert_predicate Call.viewable_by(guest_member.user), :none?
    end
  end

  context "#formatted_recordings_duration" do
    test "nil if call is active" do
      call = build(:call, recordings_duration: 60)
      assert_nil call.formatted_recordings_duration
    end

    test "nil if call is completed but has 0 recording_duration" do
      call = build(:call, :completed, recordings_duration: 0)
      assert_nil call.formatted_recordings_duration
    end

    test "present if call is completed and has positive recording_duration" do
      call = build(:call, :completed, recordings_duration: 60)
      assert_equal "1m", call.formatted_recordings_duration
    end
  end

  context "#export_json" do
    test "includes metadata" do
      call = create(:call, :completed, title: "Foo bar", summary: "<p><b>Hello</b> world</p>")
      create_list(:call_peer, 2, call: call)
      export = call.export_json
      assert_equal call.public_id, export[:id]
      assert_equal "Foo bar", export[:title]
      assert_equal "**Hello** world", export[:summary]
      assert_equal 2, export[:peers].count
    end
  end
end
