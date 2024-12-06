# frozen_string_literal: true

module EventProcessors
  class PermissionUpdatedEventProcessor < PermissionBaseEventProcessor
    def process!
      trigger_permissions_stale_event
    end
  end
end
