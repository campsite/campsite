# frozen_string_literal: true

require "test_helper"

module Threads
  class ThreadTest < ActiveSupport::TestCase
    context "#comments" do
      test "ignores random empty arrays in the middle of data" do
        data = <<~JSON.squish
          {
            "comments": [
              {
                "contentType": "reply",
                "authorID": "34428433166",
                "authorName": "Oleg Ratnikov",
                "blocks": [
                  {
                    "contentID": "34564144498",
                    "parentID": "34564126693",
                    "plaintext": "→ Review if Wolt added PII data and do the KYB check\n\nWolt can't add PII, until we ask them to. \nSo it's rather: Alert → Ask Wolt for PII → Get PII → KYB check",
                    "markdown": {
                      "content": "→ Review if Wolt added PII data and do the KYB check\nWolt can't add PII, until we ask them to. \nSo it's rather: Alert → Ask Wolt for PII → Get PII → KYB check",
                      "contentSupplements": {
                        "tables": [],
                        "codeSnippets": []
                      }
                    }
                  }
                ],
                "createdAt": "2024-02-09T18:15:03.000Z"
              },
              [],
              {
                "contentType": "reply",
                "authorID": "34428433166",
                "authorName": "Oleg Ratnikov",
                "blocks": [
                  {
                    "contentID": "34564144498",
                    "parentID": "34564126693",
                    "plaintext": "→ Review if Wolt added PII data and do the KYB check\n\nWolt can't add PII, until we ask them to. \nSo it's rather: Alert → Ask Wolt for PII → Get PII → KYB check",
                    "markdown": {
                      "content": "→ Review if Wolt added PII data and do the KYB check\nWolt can't add PII, until we ask them to. \nSo it's rather: Alert → Ask Wolt for PII → Get PII → KYB check",
                      "contentSupplements": {
                        "tables": [],
                        "codeSnippets": []
                      }
                    }
                  }
                ],
                "createdAt": "2024-02-09T18:15:03.000Z"
              }
            ]
          }
        JSON

        thread = Threads::Thread.new(data)
        assert_equal 2, thread.comments.size
      end
    end
  end
end
