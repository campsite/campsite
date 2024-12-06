# frozen_string_literal: true

class MessageThreadDmResultSerializer < ApiSerializer
  api_association :dm, blueprint: MessageThreadSerializer, nullable: true
end
