# frozen_string_literal: true

class Role
  include ActiveModel::Model

  class RoleNotFoundError < StandardError
    def message
      "unrecognized Role"
    end
  end

  attr_accessor :name, :permissions, :counted, :enforce_sso_authentication, :join_default_projects
  alias_method :counted?, :counted
  alias_method :enforce_sso_authentication?, :enforce_sso_authentication
  alias_method :join_default_projects?, :join_default_projects

  RESOURCES = [
    INVITATION_RESOURCE = "invitation",
    ADMIN_INVITATION_RESOURCE = "admin_invitation",
    COUNTED_MEMBER_INVITATION_RESOURCE = "counted_member_invitation",
    DIGEST_RESOURCE = "digest",
    MESSAGE_THREAD_RESOURCE = "message_thread",
    MESSAGE_THREAD_INTEGRATION_RESOURCE = "message_thread_integration",
    MESSAGE_RESOURCE = "message",
    POST_RESOURCE = "post",
    PROJECT_RESOURCE = "project",
    TAG_RESOURCE = "tag",
    NOTE_RESOURCE = "note",
    CUSTOM_REACTION_RESOURCE = "custom_reaction",
    CALL_ROOM_RESOURCE = "call_room",
    COMMENT_RESOURCE = "comment",
    ISSUE_RESOURCE = "issue",
    OAUTH_APPLICATION_RESOURCE = "oauth_application",
    GUEST_WITHOUT_SHARED_PROJECT_RESOURCE = "guest_without_shared_project",
  ].freeze

  ACTIONS = [
    ARCHIVE_ANY_ACTION = "archive_any",
    CREATE_ACTION = "create",
    DESTROY_ANY_ACTION = "destroy_any",
    EDIT_INTEGRATION_CONTENT_ACTION = "edit_integration_content",
    DESTROY_INTEGRATION_CONTENT_ACTION = "destroy_integration_content",
    UNARCHIVE_ANY_ACTION = "unarchive_any",
    UPDATE_ANY_ACTION = "update_any",
    VIEW_ANY_ACTION = "view_any",
    RESOLVE_ANY_ACTION = "resolve_any",
  ].freeze

  NAMES = [
    ADMIN_NAME = "admin",
    MEMBER_NAME = "member",
    VIEWER_NAME = "viewer",
    GUEST_NAME = "guest",
  ].freeze

  ALL = [
    new(
      name: ADMIN_NAME,
      permissions: {
        INVITATION_RESOURCE => [CREATE_ACTION, DESTROY_ANY_ACTION, VIEW_ANY_ACTION],
        ADMIN_INVITATION_RESOURCE => [CREATE_ACTION],
        COUNTED_MEMBER_INVITATION_RESOURCE => [CREATE_ACTION],
        DIGEST_RESOURCE => [CREATE_ACTION],
        MESSAGE_THREAD_RESOURCE => [DESTROY_ANY_ACTION],
        MESSAGE_THREAD_INTEGRATION_RESOURCE => [CREATE_ACTION],
        MESSAGE_RESOURCE => [
          CREATE_ACTION,
          DESTROY_ANY_ACTION,
        ],
        POST_RESOURCE => [
          CREATE_ACTION,
          RESOLVE_ANY_ACTION,
          EDIT_INTEGRATION_CONTENT_ACTION,
          DESTROY_INTEGRATION_CONTENT_ACTION,
        ],
        COMMENT_RESOURCE => [EDIT_INTEGRATION_CONTENT_ACTION, DESTROY_INTEGRATION_CONTENT_ACTION],
        NOTE_RESOURCE => [CREATE_ACTION],
        PROJECT_RESOURCE => [
          ARCHIVE_ANY_ACTION,
          CREATE_ACTION,
          DESTROY_ANY_ACTION,
          UNARCHIVE_ANY_ACTION,
          UPDATE_ANY_ACTION,
          VIEW_ANY_ACTION,
        ],
        TAG_RESOURCE => [
          CREATE_ACTION,
          DESTROY_ANY_ACTION,
        ],
        CUSTOM_REACTION_RESOURCE => [
          CREATE_ACTION,
          DESTROY_ANY_ACTION,
        ],
        CALL_ROOM_RESOURCE => [CREATE_ACTION],
        ISSUE_RESOURCE => [CREATE_ACTION],
        OAUTH_APPLICATION_RESOURCE => [CREATE_ACTION, UPDATE_ANY_ACTION, DESTROY_ANY_ACTION],
        GUEST_WITHOUT_SHARED_PROJECT_RESOURCE => [VIEW_ANY_ACTION],
      },
      counted: true,
      enforce_sso_authentication: true,
      join_default_projects: true,
    ),
    new(
      name: MEMBER_NAME,
      permissions: {
        INVITATION_RESOURCE => [CREATE_ACTION, DESTROY_ANY_ACTION, VIEW_ANY_ACTION],
        COUNTED_MEMBER_INVITATION_RESOURCE => [CREATE_ACTION],
        DIGEST_RESOURCE => [CREATE_ACTION],
        MESSAGE_THREAD_RESOURCE => [DESTROY_ANY_ACTION],
        MESSAGE_THREAD_INTEGRATION_RESOURCE => [CREATE_ACTION],
        MESSAGE_RESOURCE => [CREATE_ACTION],
        POST_RESOURCE => [
          CREATE_ACTION,
          RESOLVE_ANY_ACTION,
          EDIT_INTEGRATION_CONTENT_ACTION,
          DESTROY_INTEGRATION_CONTENT_ACTION,
        ],
        COMMENT_RESOURCE => [EDIT_INTEGRATION_CONTENT_ACTION, DESTROY_INTEGRATION_CONTENT_ACTION],
        NOTE_RESOURCE => [CREATE_ACTION],
        PROJECT_RESOURCE => [
          ARCHIVE_ANY_ACTION,
          CREATE_ACTION,
          DESTROY_ANY_ACTION,
          UNARCHIVE_ANY_ACTION,
          UPDATE_ANY_ACTION,
          VIEW_ANY_ACTION,
        ],
        TAG_RESOURCE => [
          CREATE_ACTION,
          DESTROY_ANY_ACTION,
        ],
        CUSTOM_REACTION_RESOURCE => [
          CREATE_ACTION,
          DESTROY_ANY_ACTION,
        ],
        CALL_ROOM_RESOURCE => [CREATE_ACTION],
        ISSUE_RESOURCE => [CREATE_ACTION],
        OAUTH_APPLICATION_RESOURCE => [CREATE_ACTION, UPDATE_ANY_ACTION, DESTROY_ANY_ACTION],
        GUEST_WITHOUT_SHARED_PROJECT_RESOURCE => [VIEW_ANY_ACTION],
      },
      counted: true,
      enforce_sso_authentication: true,
      join_default_projects: true,
    ),
    new(
      name: VIEWER_NAME,
      permissions: {
        MESSAGE_THREAD_INTEGRATION_RESOURCE => [CREATE_ACTION],
        INVITATION_RESOURCE => [CREATE_ACTION, DESTROY_ANY_ACTION, VIEW_ANY_ACTION],
        MESSAGE_RESOURCE => [CREATE_ACTION],
        POST_RESOURCE => [RESOLVE_ANY_ACTION],
        PROJECT_RESOURCE => [
          UPDATE_ANY_ACTION,
          VIEW_ANY_ACTION,
        ],
        ISSUE_RESOURCE => [CREATE_ACTION],
        GUEST_WITHOUT_SHARED_PROJECT_RESOURCE => [VIEW_ANY_ACTION],
      },
      counted: false,
      enforce_sso_authentication: true,
      join_default_projects: true,
    ),
    new(
      name: GUEST_NAME,
      permissions: {
        MESSAGE_RESOURCE => [CREATE_ACTION],
        POST_RESOURCE => [CREATE_ACTION, RESOLVE_ANY_ACTION],
        CALL_ROOM_RESOURCE => [CREATE_ACTION],
      },
      counted: false,
      enforce_sso_authentication: false,
      join_default_projects: false,
    ),
  ].freeze

  ALL_BY_NAME = ALL.index_by(&:name).freeze

  def self.by_name!(name)
    ALL_BY_NAME.fetch(name)
  rescue KeyError
    raise RoleNotFoundError
  end

  def self.with_permission(resource:, permission:)
    ALL.select { |role| role.has_permission?(resource: resource, permission: permission) }
  end

  def self.counted
    ALL.select(&:counted?)
  end

  def has_permission?(resource:, permission:)
    permissions.fetch(resource, []).include?(permission)
  end
end
