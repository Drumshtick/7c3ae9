from django.db import models
from django.db.models import Q

from . import utils

from .user import User
from .conversation import Conversation

class ConversationGroup(utils.CustomModel):
    user = models.ForeignKey(
      User, on_delete=models.CASCADE, db_column="userId", related_name="users"
    )
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        db_column="conversationId",
        related_name="conversation_groups",
        related_query_name="conversation_group"
    )
    def find_group(conversationId):
      try:
        return ConversationGroup.objects.all().filter(
          conversation_id = conversationId
        )
      except ConversationGroup.DoesNotExist:
        return None

    def find_by_users(users_array):
      try:
        """Put count as key and convo_group as key for 
        fast lookup into convo_groups_by_user"""
        convo_groups_by_user = {}
        """"""
        user_ids = {}
        for user in users_array:
          user = User.objects.get(username=user)
          user_ids.update({user.id : True})
          convo_group = ConversationGroup.objects.all().filter(
            user = user.id
            )
          convo_groups_by_user.update({convo_group.count(): convo_group})

        # User with smallest number of conversations
        user_smallest_convo_count = min(list(convo_groups_by_user.keys()))

        for group in convo_groups_by_user[user_smallest_convo_count].values():
          all_conversations = ConversationGroup.objects.all().filter(
            conversation_id = group["conversation_id"]
            ).values()
          # if amount of users in conversation doesn't equal users_array length
          # skip the inner loop
          if all_conversations.count() != len(users_array): continue

          found = True
          for convo in all_conversations:
            if user_ids.get(convo["user_id"], None) ==  None:
              found = False
          if found == True:
            return Conversation.objects.get(id = group["conversation_id"])
          
        """If a conversation with all users in 
        users_array doesn't exist return none"""
        return None

      except Exception as e:
        return None
