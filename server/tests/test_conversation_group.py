from django.test import TestCase
from rest_framework.test import APITestCase

from messenger_backend.models import ConversationGroup
from messenger_backend.models import Conversation
from messenger_backend.models import User
from messenger_backend.models import Message

class ConversationGroupTest(TestCase):
  def setUp(self):
    self.thomas = User(
      username="thomas",
      email="thomas@email.com",
      password="123456",
      photoUrl="https://res.cloudinary.com/dmlvthmqr/image/upload/v1607914467/messenger/thomas_kwzerk.png",
    )
    self.thomas.save()

    self.santiago = User(
        username="santiago",
        email="santiago@email.com",
        password="123456",
        photoUrl="https://res.cloudinary.com/dmlvthmqr/image/upload/v1607914466/messenger/775db5e79c5294846949f1f55059b53317f51e30_s3back.png",
    )
    self.santiago.save()

    self.kevin = User(
        username="kevin",
        email="kevin@email.com",
        password="123456",
        photoUrl="https://res.cloudinary.com/dmlvthmqr/image/upload/v1607914466/messenger/775db5e79c5294846949f1f55059b53317f51e30_s3back.png",
    )
    self.kevin.save()



    self.chiumbo = User(
        username="chiumbo",
        email="chiumbo@email.com",
        password="123456",
        photoUrl="https://res.cloudinary.com/dmlvthmqr/image/upload/v1607914468/messenger/8bc2e13b8ab74765fd57f0880f318eed1c3fb001_fownwt.png",
    )
    self.chiumbo.save()

    self.chiumboConvo = Conversation()
    self.chiumboConvo.save()

    self.chiumboConvoUserSantiago = ConversationGroup(user=self.chiumbo, conversation=self.chiumboConvo)
    self.chiumboConvoUserSantiago.save()

    self.chiumboConvoUserThomas = ConversationGroup(user=self.thomas, conversation=self.chiumboConvo)
    self.chiumboConvoUserThomas.save()

    self.messages = Message(
        conversation=self.chiumboConvo, senderId=self.chiumbo.id, text="Sure! What time?"
    )
    self.messages.save()

    self.messages = Message(
        conversation=self.chiumboConvo, senderId=self.thomas.id, text="3:00pm tomorrow would be good for me. "
    )
    self.messages.save()


    self.santiagoConvo = Conversation()
    self.santiagoConvo.save()

    self.santiagoConvoUserSantiago = ConversationGroup(user=self.santiago, conversation=self.santiagoConvo)
    self.santiagoConvoUserSantiago.save()

    self.santiagoConvoUserThomas = ConversationGroup(user=self.thomas, conversation=self.santiagoConvo)
    self.santiagoConvoUserThomas.save()

    self.santiagoConvoUserKevin = ConversationGroup(user=self.kevin, conversation=self.santiagoConvo)
    self.santiagoConvoUserKevin.save()

    self.messages = Message(
        conversation=self.santiagoConvo, senderId=self.santiago.id, text="Where are you from?"
    )
    self.messages.save()

    self.messages = Message(
        conversation=self.santiagoConvo, senderId=self.thomas.id, text="I'm from New York"
    )
    self.messages.save()

    self.messages = Message(
        conversation=self.santiagoConvo, senderId=self.kevin.id, text="Awesome! When did you move?"
    )
    self.messages.save()

    self.messages = Message(
        conversation=self.santiagoConvo,
        senderId=self.santiago.id,
        text="Share photo of your city, please",
    )
    self.messages.save()

    self.user_group_1 = [self.thomas.id, self.santiago.id, self.kevin.id]
    self.usernames_user_group_1 = [self.thomas.username, self.santiago.username, self.kevin.username]

  def test_find_users_by_conversation_group(self):
    """Check if finding users in conversation by conversationId returns correct users"""
    convo_group = ConversationGroup.find_group(self.santiagoConvo.id)

    found_user_ids = []
    for item in convo_group.values():
      found_user_ids.append(item["user_id"])

    self.assertListEqual(sorted(found_user_ids), sorted(self.user_group_1))

  def test_find_by_users_fails_properly(self):
    convoNone = ConversationGroup.find_by_users([self.thomas, self.chiumbo])
    self.assertEqual(convoNone, None)

  def test_find_conversation_by_usernames(self):
    """Find a conversation by an array of conversation members"""
    # print(ConversationGroup.find_by_users(self.usernames_user_group_1))
    convo = ConversationGroup.find_by_users(self.usernames_user_group_1)
    self.assertEqual(convo.id, self.santiagoConvo.id)

