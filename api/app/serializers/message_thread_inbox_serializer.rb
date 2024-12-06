# frozen_string_literal: true

class MessageThreadInboxSerializer < ApiSerializer
  api_association :threads, blueprint: MessageThreadSerializer, is_array: true
end
