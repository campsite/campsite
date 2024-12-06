# frozen_string_literal: true

require "test_helper"

class DataExportResourceTest < ActiveSupport::TestCase
  setup do
    @organization = create(:organization)
  end

  test "export_users writes users to S3" do
    members = create_list(:organization_membership, 3, organization: @organization)
    data_export = create(:data_export, subject: @organization, member: members.first)
    resource = create(:data_export_resource, data_export: data_export, resource_type: :users)
    users_json = members.map(&:export_json).to_json
    resource.expects(:write_to_s3).with("users.json", users_json)
    resource.export_users
  end

  test "export_project writes project to S3" do
    project = create(:project, organization: @organization)
    create_list(:project_membership, 3, project: project)
    data_export = create(:data_export, subject: @organization)
    resource = create(:data_export_resource, data_export: data_export, resource_type: :project, resource_id: project.id)
    resource.expects(:write_to_s3).with("#{project.export_root_path}/channel.json", project.export_json.to_json)
    resource.export_project
  end

  test "export_post writes post to S3" do
    post = create(:post, organization: @organization)
    data_export = create(:data_export, subject: @organization)
    resource = create(:data_export_resource, data_export: data_export, resource_type: :post, resource_id: post.id)
    resource.expects(:write_to_s3).with("#{post.export_root_path}/post.json", post.export_json.to_json)
    resource.export_post
  end

  test "export_attachment copies attachment to S3" do
    attachment = create(:attachment, subject: create(:post, organization: @organization))
    data_export = create(:data_export, subject: @organization)
    resource = create(:data_export_resource, data_export: data_export, resource_type: :attachment, resource_id: attachment.id)
    expected_path = "#{attachment.subject.export_root_path}/#{attachment.export_file_name}"
    resource.expects(:copy_to_s3).with(attachment.file_path, expected_path)
    resource.export_attachment
  end

  test "export_attachment skips link attachment" do
    attachment = create(:attachment, :figma_link, subject: create(:post, organization: @organization))
    data_export = create(:data_export, subject: @organization)
    resource = create(:data_export_resource, data_export: data_export, resource_type: :attachment, resource_id: attachment.id)
    resource.expects(:copy_to_s3).never
    resource.export_attachment
  end

  test "export_note copies note to S3" do
    note = create(:note, project: create(:project, organization: @organization))
    data_export = create(:data_export, subject: @organization)
    resource = create(:data_export_resource, data_export: data_export, resource_type: :note, resource_id: note.id)
    expected_path = "#{note.export_root_path}/note.json"
    resource.expects(:write_to_s3).with(expected_path, note.export_json.to_json)
    resource.export_note
  end

  test "export_call copies call to S3" do
    call = create(:call, :completed, project: create(:project, organization: @organization))
    data_export = create(:data_export, subject: @organization)
    resource = create(:data_export_resource, data_export: data_export, resource_type: :call, resource_id: call.id)
    expected_path = "#{call.export_root_path}/call.json"
    resource.expects(:write_to_s3).with(expected_path, call.export_json.to_json)
    resource.export_call
  end

  test "export_call_recording copies call recording to S3" do
    project = create(:project, organization: @organization)
    call = create(:call, :completed, project: project)
    recording = create(:call_recording, call: call, file_path: "call/path/recording.mp4")
    data_export = create(:data_export, subject: @organization)
    resource = create(:data_export_resource, data_export: data_export, resource_type: :call_recording, resource_id: recording.id)
    expected_path = "#{call.export_root_path}/recordings/#{recording.public_id}.mp4"
    resource.expects(:copy_to_s3).with(recording.file_path, expected_path)
    resource.expects(:write_to_s3).with("#{call.export_root_path}/recordings/#{recording.public_id}_transcription.vtt", recording.transcription_vtt)
    resource.export_call_recording
  end

  test "export_member copies user to S3" do
    member = create(:organization_membership, organization: @organization)
    data_export = create(:data_export, subject: member, member: member)
    resource = create(:data_export_resource, data_export: data_export, resource_type: :member)
    resource.expects(:write_to_s3).with("user.json", member.export_json.to_json)
    resource.export_member
  end
end
