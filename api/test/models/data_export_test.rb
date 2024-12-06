# frozen_string_literal: true

require "test_helper"

class DataExportTest < ActiveSupport::TestCase
  test "creates resources for accessible projects and posts" do
    org = create(:organization)
    data_export = create(:data_export, subject: org)

    project = create(:project, organization: org)
    post = create(:post, project: project)
    call = create(:call, :recorded, :completed, project: project)
    note = create(:note, project: project)

    private_project = create(:project, organization: org, private: true)
    private_post = create(:post, project: private_project)
    private_call = create(:call, :recorded, :completed, project: private_project)
    private_note = create(:note, project: private_project)

    assert_difference -> { DataExportResource.count }, 6 do
      data_export.create_resources
    end

    assert_not_nil data_export.resources.find_by(resource_type: :users)
    assert_not_nil data_export.resources.find_by(resource_type: :project, resource_id: project.id)
    assert_not_nil data_export.resources.find_by(resource_type: :post, resource_id: post.id)
    assert_not_nil data_export.resources.find_by(resource_type: :call, resource_id: call.id)
    assert_not_nil data_export.resources.find_by(resource_type: :note, resource_id: note.id)
    assert_not_nil data_export.resources.find_by(resource_type: :call_recording, resource_id: call.recordings.first.id)

    assert_nil data_export.resources.find_by(resource_type: :project, resource_id: private_project.id)
    assert_nil data_export.resources.find_by(resource_type: :post, resource_id: private_post.id)
    assert_nil data_export.resources.find_by(resource_type: :call, resource_id: private_call.id)
    assert_nil data_export.resources.find_by(resource_type: :note, resource_id: private_note.id)
    assert_nil data_export.resources.find_by(resource_type: :call_recording, resource_id: private_call.recordings.first.id)
  end

  test "cleanup deletes zip file from S3" do
    data_export = create(:data_export, subject: create(:organization), zip_path: "some/zip/path.zip")
    id = data_export.id
    S3_BUCKET.expects(:object).with("some/zip/path.zip").returns(stub(delete: nil))
    data_export.cleanup!
    assert_nil DataExport.find_by(id: id)
  end

  test "creates resources for user's posts" do
    viewer = create(:organization_membership)
    org = viewer.organization
    data_export = create(:data_export, subject: viewer, member: viewer)

    project = create(:project, organization: org)
    viewer_post = create(:post, project: project, member: viewer)
    other_post = create(:post, project: project)

    private_project = create(:project, organization: org, private: true)
    viewer_private_post = create(:post, project: private_project, member: viewer)
    other_private_post = create(:post, project: private_project)

    assert_difference -> { DataExportResource.count }, 5 do
      data_export.create_resources
    end

    assert_not_nil data_export.resources.find_by(resource_type: :member)
    assert_not_nil data_export.resources.find_by(resource_type: :post, resource_id: viewer_post.id)
    assert_not_nil data_export.resources.find_by(resource_type: :post, resource_id: viewer_private_post.id)
    assert_not_nil data_export.resources.find_by(resource_type: :project, resource_id: project.id)
    assert_not_nil data_export.resources.find_by(resource_type: :project, resource_id: private_project.id)

    assert_nil data_export.resources.find_by(resource_type: :post, resource_id: other_post.id)
    assert_nil data_export.resources.find_by(resource_type: :call, resource_id: other_private_post.id)
  end
end
