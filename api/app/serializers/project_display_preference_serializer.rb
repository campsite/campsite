# frozen_string_literal: true

class ProjectDisplayPreferenceSerializer < ApiSerializer
  api_field :display_reactions, type: :boolean, default: true
  api_field :display_attachments, type: :boolean, default: true
  api_field :display_comments, type: :boolean, default: true
  api_field :display_resolved, type: :boolean, default: true
end
