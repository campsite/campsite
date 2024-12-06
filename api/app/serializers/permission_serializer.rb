# frozen_string_literal: true

class PermissionSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_association :user, blueprint: UserSerializer
  api_field :action, enum: Permission.actions.keys
end
