# frozen_string_literal: true

class AccessGrant < ApplicationRecord
  include ::Doorkeeper::Orm::ActiveRecord::Mixins::AccessGrant

  self.table_name = "oauth_access_grants"
end
