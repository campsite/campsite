# frozen_string_literal: true

module AttachmentsReorderable
  extend ActiveSupport::Concern

  included do
    def reorder_attachments(id_position_list)
      attachments_by_id = attachments.where(public_id: id_position_list.pluck(:id)).index_by(&:public_id)

      attachment_attrs = id_position_list.map do |pair|
        attachment = attachments_by_id[pair[:id]]
        raise ActiveRecord::RecordNotFound unless attachment

        attachment.attributes.merge({ position: pair[:position].to_i })
      end

      Attachment.upsert_all(attachment_attrs)
    end
  end
end
