# frozen_string_literal: true

class SyncMessageThreadsSerializer < ApiSerializer
  api_association :threads, is_array: true, blueprint: SyncMessageThreadSerializer
  api_association :new_thread_members, is_array: true, blueprint: OrganizationMemberSerializer
end
