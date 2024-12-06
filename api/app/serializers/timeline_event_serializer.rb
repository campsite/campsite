# frozen_string_literal: true

class TimelineEventSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :created_at
  api_field :action, enum: TimelineEvent.actions.keys

  api_field :subject_updated_from_title, nullable: true
  api_field :subject_updated_to_title, nullable: true

  api_association :subject_updated_from_project, blueprint: MiniProjectSerializer, nullable: true do |timeline_event, options|
    next unless timeline_event.subject_updated_from_project_id

    project = options[:organization].projects.find_by(id: timeline_event.subject_updated_from_project_id)

    # return nil if the project no longer exists
    next nil unless project

    next project if options[:user] && Pundit.policy!(options[:user], project).show?
  end
  api_association :subject_updated_to_project, blueprint: MiniProjectSerializer, nullable: true do |timeline_event, options|
    next unless timeline_event.subject_updated_to_project_id

    project = options[:organization].projects.find_by(id: timeline_event.subject_updated_to_project_id)

    # return nil if the project no longer exists
    next nil unless project

    next project if options[:user] && Pundit.policy!(options[:user], project).show?
  end

  api_field :comment_reference_subject_type, nullable: true do |timeline_event|
    timeline_event.comment_reference&.subject_type
  end
  api_field :comment_reference_subject_title, nullable: true do |timeline_event|
    timeline_event.comment_reference&.subject_title
  end

  api_association :member_actor, blueprint: OrganizationMemberSerializer, nullable: true
  api_association :external_reference, blueprint: ExternalRecordSerializer, nullable: true
  api_association :post_reference, blueprint: PostSerializer, nullable: true
  api_association :comment_reference, blueprint: CommentSerializer, nullable: true
  api_association :note_reference, blueprint: NoteSerializer, nullable: true
end
