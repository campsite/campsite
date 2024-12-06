# frozen_string_literal: true

module EventProcessors
  class ProjectBaseEventProcessor < BaseEventProcessor
    alias_method :project, :subject

    delegate :kept_project_memberships, to: :project
  end
end
