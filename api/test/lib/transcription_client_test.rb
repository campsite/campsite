# frozen_string_literal: true

require "test_helper"

class TranscriptionClientTest < ActiveSupport::TestCase
  describe "transcription client" do
    setup do
      @job = OpenStruct.new({ # rubocop:disable Style/OpenStructUse
        transcription_job: OpenStruct.new({ # rubocop:disable Style/OpenStructUse
          transcription_job_name: "1cef4bfc-b574-4976-8fe0-961d613061e0",
          transcription_job_status: "IN_PROGRESS",
          language_code: "en-US",
          media: OpenStruct.new({ # rubocop:disable Style/OpenStructUse
            media_file_uri: "s3://campsite-media-dev/o/wjkgtj0gcir5/p/1cef4bfc-b574-4976-8fe0-961d613061e0.webm",
            redacted_media_file_uri: nil,
          }),
          transcript: nil,
          start_time: "2023-04-26 20:45:59 150995/524288 -0400",
          creation_time: "2023-04-26 20:45:59 551551/2097152 -0400",
          subtitles: OpenStruct.new({ # rubocop:disable Style/OpenStructUse
            formats: ["vtt", "srt"],
          }),
        }),
      })

      @vtt_stream = mock
      @vtt_stream.stubs(:read).returns("WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nHello World")
      @vtt = mock
      @vtt.stubs(:body).returns(@vtt_stream)

      @user_member = create(:organization_membership)
      @user = @user_member.user
      @organization = @user.organizations.first
      @post = create(:post, organization: @organization, member: @user_member)

      Attachment.any_instance.stubs(:enqueue_transcription_job).returns(true)
      @attachment = create(
        :attachment,
        :video,
        subject: @post,
        file_path: "#{@organization.post_file_key_prefix}1cef4bfc-b574-4976-8fe0-961d613061e0.webm",
        file_type: "video/webm",
      )
    end

    it "accepts an attachment and starts as job" do
      client = TranscriptionClient.new(@attachment)
      client.send(:transcriber_client).expects(:start_transcription_job).returns(@job)
      result = client.start
      assert_equal "1cef4bfc-b574-4976-8fe0-961d613061e0", result.transcription_job.transcription_job_name
      assert_equal "IN_PROGRESS", result.transcription_job.transcription_job_status
    end

    it "accepts an attachment and gets the status of the job" do
      @job.transcription_job.transcription_job_status = "COMPLETED"
      client = TranscriptionClient.new(@attachment)
      client.send(:transcriber_client).expects(:get_transcription_job).returns(@job)
      status = client.status
      assert_equal "COMPLETED", status
    end

    it "accepts an attachment and fetches the vtt" do
      client = TranscriptionClient.new(@attachment)
      client.send(:s3_client).expects(:get_object).with({
        bucket: "campsite-hls-test",
        key: "#{@organization.post_file_key_prefix}1cef4bfc_b574_4976_8fe0_961d613061e0.vtt",
      }).returns(@vtt)
      vtt = client.vtt
      assert_match "Hello World", vtt
    end
  end
end
