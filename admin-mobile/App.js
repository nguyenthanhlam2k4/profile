import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  Modal, 
  SafeAreaView, 
  StatusBar,
  Dimensions,
  Image,
  Switch,
  Linking,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Updates from 'expo-updates';
import ImageCropper from './ImageCropper';

// Import Icons
import { 
  Mail, 
  Briefcase, 
  Cpu, 
  Image as ImageIcon, 
  User, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Send, 
  Info,
  Calendar,
  Lock,
  Globe,
  Settings,
  Star,
  CheckCircle,
  FileText,
  Camera,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Bot,
  HelpCircle
} from 'lucide-react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

// Import Firebase and Cloudinary Services
import { 
  auth, 
  db,
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  updateProjectsOrder,
  subscribeProjects,
  getSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  updateSkillsOrder,
  subscribeSkills,
  getProfile,
  updateProfile,
  subscribeProfile,
  subscribeMessages,
  deleteMessage,
  getSocials,
  updateSocial,
  getDashboardStats,
  subscribeViews,
  subscribeGallery,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  setHomeGalleryImage,
  subscribeAiKb,
  addAiKb,
  updateAiKb,
  deleteAiKb,
  subscribeAiUnanswered,
  deleteAiUnanswered
} from './firebase';
import { uploadImage } from './cloudinary';

// Configure notification appearance
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const { width } = Dimensions.get('window');

export default function App() {
  // Authentication State
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const prevMessageCount = useRef(null); // track previous count to detect new messages
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [lockPassword, setLockPassword] = useState('');
  const [lockPasswordLoading, setLockPasswordLoading] = useState(false);
  const [isPasscodeBypassVisible, setIsPasscodeBypassVisible] = useState(false);

  // App Navigation & Tabs State
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | messages | projects | skills | gallery | profile
  const [globalStats, setGlobalStats] = useState({
    totalProjects: 0,
    totalSkills: 0,
    profileViews: 0,
    messagesCount: 0
  });

  // Data Loading states
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Database Items States
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [profile, setProfile] = useState({
    name: '', title: '', email: '', phone: '', location: '', bio: '',
    github: '', linkedin: '', facebook: '', aiPrompt: ''
  });

  // Modal / Detail States
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');

  // AI Q&A Management States
  const [aiKb, setAiKb] = useState([]);
  const [aiUnanswered, setAiUnanswered] = useState([]);
  const [aiQaModalVisible, setAiQaModalVisible] = useState(false);
  const [aiQaForm, setAiQaForm] = useState({ id: null, question: '', answer: '' });
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null);
  const [aiQaTab, setAiQaTab] = useState('kb'); // 'kb' | 'unanswered'

  const liveSelectedMessage = selectedMessage 
    ? messages.find(m => m.id === selectedMessage.id) || selectedMessage 
    : null;

  const [cropperConfig, setCropperConfig] = useState({
    visible: false,
    imageUri: '',
    imageWidth: 0,
    imageHeight: 0,
    aspectRatio: 16 / 9,
    onSuccess: null
  });

  const handleCropComplete = async (croppedUri) => {
    setCropperConfig(prev => ({ ...prev, visible: false }));
    setImageUploading(true);
    try {
      const secureUrl = await uploadImage(croppedUri);
      if (cropperConfig.onSuccess) {
        cropperConfig.onSuccess(secureUrl);
      }
      showToast('Tải ảnh thành công!');
    } catch (error) {
      console.error('Upload cropped image failed:', error);
      Alert.alert('Lỗi tải ảnh', 'Không thể upload ảnh sau khi cắt, vui lòng kiểm tra kết nối!');
    } finally {
      setImageUploading(false);
    }
  };
  const [replyLoading, setReplyLoading] = useState(false);
  const [projectModal, setProjectModal] = useState({ visible: false, mode: 'add', data: null });
  const [skillModal, setSkillModal] = useState({ visible: false, mode: 'add', data: null });
  const [galleryModal, setGalleryModal] = useState({ visible: false, mode: 'add', data: null });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form Fields States
  const [projectForm, setProjectForm] = useState({
    title: '', subtitle: '', description: '', tags: '',
    githubLink: '', liveLink: '', image: '', orderIndex: '0'
  });
  const [skillForm, setSkillForm] = useState({
    name: '', category: 'Frontend', level: '80'
  });
  const [galleryForm, setGalleryForm] = useState({
    title: '', url: '', postedAt: ''
  });
  // Trigger biometric authentication
  const triggerBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Xác thực để truy cập NTL Admin',
        fallbackLabel: 'Nhập mật mã thiết bị',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAppLocked(false);
        showToast('Mở khóa thành công!');
      } else {
        Alert.alert(
          'Xác thực thất bại',
          `Kết quả xác thực: ${JSON.stringify(result)}`,
          [
            { text: 'Thử lại', onPress: () => setTimeout(triggerBiometricAuth, 500) },
            { text: 'OK' }
          ]
        );
      }
    } catch (e) {
      console.error('Biometric authentication error:', e);
      Alert.alert('Lỗi Ngoại Lệ Sinh Trắc', `Ngoại lệ: ${e.message || JSON.stringify(e)}`);
    }
  };

  // Handle passcode bypass using Firebase password
  const handleUnlockWithPassword = async () => {
    if (!lockPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu.');
      return;
    }
    setLockPasswordLoading(true);
    try {
      if (user && user.email) {
        const { signInWithEmailAndPassword } = require('firebase/auth');
        await signInWithEmailAndPassword(auth, user.email, lockPassword);
        setIsAppLocked(false);
        setLockPassword('');
        setIsPasscodeBypassVisible(false);
        showToast('Mở khóa thành công!');
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin tài khoản.');
      }
    } catch (err) {
      console.error('Password unlock error:', err);
      Alert.alert('Thất bại', 'Mật khẩu không chính xác, vui lòng thử lại.');
    } finally {
      setLockPasswordLoading(false);
    }
  };

  // Check biometric support and enabled state on app start
  useEffect(() => {
    const checkBiometrics = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(hasHardware);
      
      const enabledVal = await AsyncStorage.getItem('isBiometricEnabled');
      if (enabledVal === 'true') {
        setIsBiometricEnabled(true);
      }
    };
    checkBiometrics();
  }, []);

  // Request notification permissions
  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
    }
  };

  // Handle Authentication status on load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      setUser(usr);
      setAuthLoading(false);
      if (usr) {
        loadInitialData();
        requestNotificationPermission();
        
        // Lock screen if biometric is enabled
        const enabledVal = await AsyncStorage.getItem('isBiometricEnabled');
        if (enabledVal === 'true') {
          setIsAppLocked(true);
          setTimeout(() => {
            triggerBiometricAuth();
          }, 300);
        }
      }
    });
    return unsubscribe;
  }, []);

  // Fetch Dashboard and initial items
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const stats = await getDashboardStats();
      if (stats) setGlobalStats(stats);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop reordering handlers
  const handleProjectsDragEnd = async ({ data: newData }) => {
    setProjects(newData);
    try {
      await updateProjectsOrder(newData);
      showToast('Đã đồng bộ thứ tự dự án lên Website!');
    } catch (error) {
      console.error('Error updating projects order:', error);
      showToast('Lỗi đồng bộ thứ tự dự án!');
    }
  };

  const handleSkillsDragEnd = async ({ data: newData }) => {
    setSkills(newData);
    try {
      await updateSkillsOrder(newData);
      showToast('Đã đồng bộ thứ tự kỹ năng lên Website!');
    } catch (error) {
      console.error('Error updating skills order:', error);
      showToast('Lỗi đồng bộ thứ tự kỹ năng!');
    }
  };

  // Real-time messages listener with push notification
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeMessages((msgs) => {
      // Detect new message: only notify after first load (prevMessageCount is set)
      if (prevMessageCount.current !== null && msgs.length > prevMessageCount.current) {
        const newest = msgs[0]; // messages are ordered by newest first
        Notifications.scheduleNotificationAsync({
          content: {
            title: `📩 Tin nhắn mới từ ${newest?.name || 'Khách'}`,
            body: newest?.message || 'Bạn có một tin nhắn mới!',
            sound: true,
          },
          trigger: null, // fire immediately
        });
      }
      prevMessageCount.current = msgs.length;
      setMessages(msgs);
      setGlobalStats(prev => ({ ...prev, messagesCount: msgs.length }));
    }, (err) => {
      console.error('Messages stream error:', err);
    });
    return unsubscribe;
  }, [user]);

  // Real-time views listener
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeViews((count) => {
      setGlobalStats(prev => ({ ...prev, profileViews: count }));
    }, (err) => {
      console.error('Views stream error:', err);
    });
    return unsubscribe;
  }, [user]);

  // Real-time gallery listener
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeGallery((items) => {
      setGallery(items);
    }, (err) => {
      console.error('Gallery stream error:', err);
    });
    return unsubscribe;
  }, [user]);

  // Real-time projects listener
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeProjects((projs) => {
      setProjects(projs);
      setGlobalStats(prev => ({ ...prev, totalProjects: projs.length }));
    }, (err) => {
      console.error('Projects stream error:', err);
    });
    return unsubscribe;
  }, [user]);

  // Real-time skills listener
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeSkills((skls) => {
      setSkills(skls);
      setGlobalStats(prev => ({ ...prev, totalSkills: skls.length }));
    }, (err) => {
      console.error('Skills stream error:', err);
    });
    return unsubscribe;
  }, [user]);

  // Real-time profile listener
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeProfile((prof) => {
      if (prof) {
        setProfile({
          name: prof.name || '',
          title: prof.title || '',
          email: prof.email || '',
          phone: prof.phone || '',
          location: prof.location || '',
          bio: prof.bio || '',
          github: prof.github || '',
          linkedin: prof.linkedin || '',
          facebook: prof.facebook || '',
          aiPrompt: prof.aiPrompt || ''
        });
      }
    }, (err) => {
      console.error('Profile stream error:', err);
    });
    return unsubscribe;
  }, [user]);

  // Real-time AI Q&A listener
  useEffect(() => {
    if (!user) return;
    const unsubKb = subscribeAiKb((data) => setAiKb(data), (err) => console.error('AI KB subscribe error:', err));
    const unsubUnanswered = subscribeAiUnanswered((data) => setAiUnanswered(data), (err) => console.error('AI Unanswered subscribe error:', err));
    return () => {
      unsubKb();
      unsubUnanswered();
    };
  }, [user]);

  // Real-time EAS OTA updates listener/checking
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    if (isUpdateAvailable) {
      Updates.fetchUpdateAsync().catch(err => console.error("EAS Fetch Update Error:", err));
    }
  }, [isUpdateAvailable]);

  useEffect(() => {
    if (isUpdatePending) {
      Alert.alert(
        '🔄 Bản cập nhật mới',
        'Đã tải xong bản cập nhật mới cho NTL Admin. Khởi động lại ứng dụng ngay?',
        [
          { text: 'Để sau', style: 'cancel' },
          { 
            text: 'Cập nhật ngay', 
            onPress: async () => {
              try {
                await Updates.reloadAsync();
              } catch (e) {
                console.error('Error reloading app:', e);
              }
            }
          }
        ],
        { cancelable: false }
      );
    }
  }, [isUpdatePending]);

  // Handle Log In
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      
      // Proactively prompt to enable biometrics if supported but not yet enabled
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (hasHardware) {
        const enabledVal = await AsyncStorage.getItem('isBiometricEnabled');
        if (enabledVal !== 'true') {
          Alert.alert(
            'Kích hoạt Face ID / Touch ID',
            'Bạn có muốn sử dụng Face ID hoặc vân tay để đăng nhập nhanh hơn cho lần sau không?',
            [
              { text: 'Để sau', style: 'cancel' },
              { 
                text: 'Kích hoạt ngay', 
                onPress: async () => {
                  await AsyncStorage.setItem('isBiometricEnabled', 'true');
                  setIsBiometricEnabled(true);
                  showToast('Đã kích hoạt Face ID / Touch ID!');
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Đăng nhập thất bại', 'Sai Email hoặc Mật khẩu quản trị!');
    } finally {
      setLoginLoading(false);
    }
  };

  // Switch toggle handler
  const handleToggleBiometrics = async (value) => {
    try {
      if (value) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Xác minh để kích hoạt Face ID / Touch ID',
          disableDeviceFallback: false,
        });

        if (result.success) {
          await AsyncStorage.setItem('isBiometricEnabled', 'true');
          setIsBiometricEnabled(true);
          showToast('Đã kích hoạt Face ID / Touch ID!');
        } else {
          setIsBiometricEnabled(false);
          Alert.alert(
            'Xác thực thất bại', 
            `Kết quả xác thực: ${JSON.stringify(result)}`
          );
        }
      } else {
        await AsyncStorage.setItem('isBiometricEnabled', 'false');
        setIsBiometricEnabled(false);
        showToast('Đã tắt Face ID / Touch ID.');
      }
    } catch (e) {
      console.error('Error toggling biometrics:', e);
      Alert.alert(
        'Lỗi Ngoại Lệ Sinh Trắc', 
        `Ngoại lệ: ${e.message || JSON.stringify(e)}`
      );
    }
  };

  // Run biometric diagnostics
  const runBiometricDiagnostics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const enabledVal = await AsyncStorage.getItem('isBiometricEnabled');
      
      let typesStr = 'Không có';
      if (types && types.length > 0) {
        typesStr = types.map(t => {
          if (t === 1) return 'Vân tay (TouchID)';
          if (t === 2) return 'Khuôn mặt (FaceID)';
          return `Khác (${t})`;
        }).join(', ');
      }
      
      Alert.alert(
        'Chẩn Đoán Sinh Trắc Học',
        `1. Hỗ trợ phần cứng: ${hasHardware ? 'Có' : 'Không'}\n` +
        `2. Đã cài FaceID/Vân tay hệ thống: ${isEnrolled ? 'Có' : 'Không'}\n` +
        `3. Các loại hỗ trợ: ${typesStr}\n` +
        `4. Trạng thái trong App: ${enabledVal === 'true' ? 'Đã bật' : 'Chưa bật'}\n\n` +
        `💡 Hướng dẫn:\n` +
        `- Nếu phần cứng báo 'Không', thiết bị của bạn không có camera FaceID hoặc cảm biến vân tay.\n` +
        `- Nếu phần hệ thống báo 'Không', hãy vào Cài đặt của iPhone -> Face ID & Mật mã để thiết lập khuôn mặt trước!\n` +
        `- Đảm bảo ứng dụng Expo Go đã được cấp quyền FaceID trong cài đặt hệ thống của iPhone.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Lỗi Chẩn Đoán', error.message || 'Không thể chạy chẩn đoán');
    }
  };
  // Handle send email reply (Google Gmail Integration)
  const handleSendEmailReply = async () => {
    if (!replyText.trim() || !liveSelectedMessage) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập nội dung phản hồi.');
      return;
    }

    setReplyLoading(true);
    try {
      const subject = `Re: ${liveSelectedMessage.subject || 'Liên hệ từ Website'}`;
      const body = replyText;
      
      // On iOS/Android, native Gmail app deep link:
      const gmailAppUrl = `googlegmail:///co?to=${liveSelectedMessage.email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Gmail web fallback
      const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${liveSelectedMessage.email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Direct trial block to bypass iOS canOpenURL privacy restrictions inside default Expo Go app
      try {
        await Linking.openURL(gmailAppUrl);
        showToast('Đã mở ứng dụng Gmail!');
      } catch (openAppErr) {
        console.log('Cannot open native Gmail app directly, falling back to Web Gmail:', openAppErr);
        await Linking.openURL(gmailWebUrl);
        showToast('Đã mở Gmail trên Trình duyệt!');
      }
      
      // Save reply history to Firestore
      const msgRef = doc(db, 'messages', liveSelectedMessage.id);
      await updateDoc(msgRef, {
        replied: true,
        replyText: replyText,
        repliedAt: new Date().toISOString()
      });
      
      setReplyText('');
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error sending email reply:', error);
      try {
        const msgRef = doc(db, 'messages', liveSelectedMessage.id);
        await updateDoc(msgRef, {
          replied: true,
          replyText: replyText,
          repliedAt: new Date().toISOString()
        });
        
        Alert.alert(
          'Đã Lưu Phản Hồi',
          `Hệ thống đã lưu nội dung phản hồi. Thiết bị không hỗ trợ tự động mở liên kết Gmail.\n\nEmail nhận: ${liveSelectedMessage.email}`,
          [{ text: 'OK', onPress: () => {
            setReplyText('');
            setSelectedMessage(null);
          }}]
        );
      } catch (dbErr) {
        console.error('Database update error during general reply fallback:', dbErr);
        Alert.alert('Lỗi', 'Không thể lưu phản hồi.');
      }
    } finally {
      setReplyLoading(false);
    }
  };

  const handleLogoutForce = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAppLocked(false);
      showToast('Đã đăng xuất.');
    } catch (error) {
      console.error('Direct logout error:', error);
    }
  };

  // Handle Log Out
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              setUser(null);
              setIsAppLocked(false);
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  // Pick Image from mobile gallery and upload to Cloudinary
  const pickAndUploadImage = async (aspectRatio, onSuccess) => {
    let ratio = 16 / 9;
    let successCallback = onSuccess;
    if (typeof aspectRatio === 'function') {
      successCallback = aspectRatio;
      ratio = 16 / 9;
    } else if (typeof aspectRatio === 'number') {
      ratio = aspectRatio;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện để chọn ảnh!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Turn off native system cropping because we use our custom ImageCropper!
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      setCropperConfig({
        visible: true,
        imageUri: result.assets[0].uri,
        imageWidth: result.assets[0].width || 0,
        imageHeight: result.assets[0].height || 0,
        aspectRatio: ratio,
        onSuccess: successCallback
      });
    }
  };

  // Pick Image from mobile camera (Locket style)
  const takeLocketPhoto = async (aspectRatio, onSuccess) => {
    let ratio = 1 / 1;
    let successCallback = onSuccess;
    if (typeof aspectRatio === 'function') {
      successCallback = aspectRatio;
      ratio = 1 / 1;
    } else if (typeof aspectRatio === 'number') {
      ratio = aspectRatio;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền sử dụng máy ảnh để chụp ảnh!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Turn off native system cropping
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      setCropperConfig({
        visible: true,
        imageUri: result.assets[0].uri,
        imageWidth: result.assets[0].width || 0,
        imageHeight: result.assets[0].height || 0,
        aspectRatio: ratio,
        onSuccess: successCallback
      });
    }
  };

  // --- CRUD HANDLERS ---

  // Project Add / Edit
  const openProjectModal = (mode, data = null) => {
    if (mode === 'add') {
      setProjectForm({
        title: '', subtitle: '', description: '', tags: '',
        githubLink: '', liveLink: '', image: '', orderIndex: '0'
      });
    } else {
      setProjectForm({
        title: data.title || '',
        subtitle: data.subtitle || '',
        description: data.description || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
        githubLink: data.githubLink || '',
        liveLink: data.liveLink || '',
        image: data.image || '',
        orderIndex: String(data.orderIndex || 0)
      });
    }
    setProjectModal({ visible: true, mode, data });
  };

  const handleSaveProject = async () => {
    if (!projectForm.title.trim() || !projectForm.description.trim()) {
      Alert.alert('Lỗi', 'Tiêu đề và Mô tả dự án là bắt buộc!');
      return;
    }

    const tagsArray = projectForm.tags
      ? projectForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const formattedData = {
      title: projectForm.title.trim(),
      subtitle: projectForm.subtitle.trim(),
      description: projectForm.description.trim(),
      tags: tagsArray,
      githubLink: projectForm.githubLink.trim(),
      liveLink: projectForm.liveLink.trim(),
      image: projectForm.image.trim(),
      orderIndex: parseInt(projectForm.orderIndex) || 0
    };

    setLoading(true);
    try {
      if (projectModal.mode === 'add') {
        await addProject(formattedData);
      } else {
        await updateProject(projectModal.data.id, formattedData);
      }
      setProjectModal({ visible: false, mode: 'add', data: null });
      Alert.alert('Thành công', 'Đã lưu thông tin dự án!');
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert('Thất bại', 'Có lỗi xảy ra khi lưu dự án.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = (id) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa dự án này khỏi website?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteProject(id);
              Alert.alert('Đã xóa', 'Dự án đã được gỡ khỏi website!');
            } catch (error) {
              console.error('Delete project failed:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Skill Add / Edit
  const openSkillModal = (mode, data = null) => {
    if (mode === 'add') {
      setSkillForm({ name: '', category: 'Frontend', level: '80' });
    } else {
      setSkillForm({
        name: data.name || '',
        category: data.category || 'Frontend',
        level: String(data.level || 80)
      });
    }
    setSkillModal({ visible: true, mode, data });
  };

  const handleSaveSkill = async () => {
    if (!skillForm.name.trim()) {
      Alert.alert('Lỗi', 'Tên kỹ năng không được để trống!');
      return;
    }

    const formattedData = {
      name: skillForm.name.trim(),
      category: skillForm.category,
      level: parseInt(skillForm.level) || 80
    };

    setLoading(true);
    try {
      if (skillModal.mode === 'add') {
        await addSkill(formattedData);
      } else {
        await updateSkill(skillModal.data.id, formattedData);
      }
      setSkillModal({ visible: false, mode: 'add', data: null });
      Alert.alert('Thành công', 'Kỹ năng đã được lưu!');
    } catch (error) {
      console.error('Error saving skill:', error);
      Alert.alert('Thất bại', 'Có lỗi xảy ra khi lưu kỹ năng.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = (id) => {
    Alert.alert(
      'Xóa kỹ năng',
      'Bạn muốn xóa kỹ năng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteSkill(id);
            } catch (error) {
              console.error('Delete skill error:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Profile Save
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile({
        name: profile.name.trim(),
        title: profile.title.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        location: profile.location.trim(),
        bio: profile.bio.trim(),
        github: profile.github.trim(),
        linkedin: profile.linkedin.trim(),
        facebook: profile.facebook.trim(),
        aiPrompt: (profile.aiPrompt || '').trim()
      });
      Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân lên trang chủ!');
    } catch (error) {
      console.error('Update profile failed:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  // Message Actions
  const handleDeleteMessage = (id) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa tin nhắn liên hệ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setSelectedMessage(null);
            try {
              await deleteMessage(id);
            } catch (error) {
              console.error('Delete message error:', error);
            }
          }
        }
      ]
    );
  };

  // Gallery CRUD Handlers
  const handleLocketCapture = () => {
    takeLocketPhoto(1 / 1, (secureUrl) => {
      setGalleryForm({
        title: '',
        url: secureUrl,
        postedAt: new Date().toISOString()
      });
      setGalleryModal({ visible: true, mode: 'locket', data: null });
    });
  };

  const openGalleryModal = (mode, data = null) => {
    if (mode === 'add') {
      setGalleryForm({ title: '', url: '', postedAt: new Date().toISOString() });
    } else {
      setGalleryForm({
        title: data.title || '',
        url: data.url || '',
        postedAt: data.postedAt || new Date().toISOString()
      });
    }
    setGalleryModal({ visible: true, mode, data });
  };

  const handleSaveGallery = async () => {
    if (!galleryForm.url) {
      Alert.alert('Lỗi', 'Vui lòng chọn hình ảnh!');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: galleryForm.title.trim(),
        url: galleryForm.url,
        postedAt: galleryForm.postedAt,
      };
      if (galleryModal.mode === 'add' || galleryModal.mode === 'locket') {
        payload.isHome = false;
        await addGalleryItem(payload);
      } else {
        await updateGalleryItem(galleryModal.data.id, payload);
      }
      setGalleryModal({ visible: false, mode: 'add', data: null });
    } catch (error) {
      console.error('Save gallery error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGallery = (id) => {
    Alert.alert(
      'Gỡ ảnh',
      'Gỡ bỏ hình ảnh này khỏi thư viện website?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteGalleryItem(id);
            } catch (error) {
              console.error('Delete gallery error:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSetHomeImage = async (id) => {
    setLoading(true);
    try {
      await setHomeGalleryImage(id);
      Alert.alert('Thành công', 'Ảnh tiêu điểm Slider trang chủ đã được thay đổi!');
    } catch (error) {
      console.error('Set home image failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // AI Q&A Handlers
  const handleSaveAiQa = async () => {
    if (!aiQaForm.question.trim() || !aiQaForm.answer.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ câu hỏi và câu trả lời!');
      return;
    }
    setLoading(true);
    try {
      if (aiQaForm.id) {
        await updateAiKb(aiQaForm.id, {
          question: aiQaForm.question.trim(),
          answer: aiQaForm.answer.trim()
        });
        showToast('Đã cập nhật cặp Q&A!');
      } else {
        await addAiKb({
          question: aiQaForm.question.trim(),
          answer: aiQaForm.answer.trim()
        });
        if (answeringQuestionId) {
          await deleteAiUnanswered(answeringQuestionId);
        }
        showToast('Đã thêm bài học Q&A mới!');
      }
      setAiQaForm({ id: null, question: '', answer: '' });
      setAnsweringQuestionId(null);
    } catch (error) {
      console.error('Save AI QA failed:', error);
      Alert.alert('Thất bại', 'Không thể lưu bài học AI Q&A.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAiQa = (id) => {
    Alert.alert(
      'Xóa Q&A',
      'Bạn muốn xóa bài học Q&A này khỏi AI?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAiKb(id);
              showToast('Đã xóa bài học.');
            } catch (error) {
              console.error('Delete AI QA failed:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAiUnanswered = (id) => {
    Alert.alert(
      'Xóa câu hỏi',
      'Xóa câu hỏi bị bỏ lỡ này khỏi danh sách?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAiUnanswered(id);
              showToast('Đã xóa câu hỏi.');
            } catch (error) {
              console.error('Delete unanswered failed:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Format Date safely
  const formatMsgDate = (dateVal) => {
    if (!dateVal) return 'Vừa xong';
    try {
      if (dateVal.seconds) {
        return new Date(dateVal.seconds * 1000).toLocaleString('vi-VN');
      }
      return new Date(dateVal).toLocaleString('vi-VN');
    } catch (e) {
      return String(dateVal);
    }
  };

  // Splash Loading Screen
  if (authLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.splashContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.splashText}>Đang tải cấu hình kết nối...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.loginContainer}>
          <StatusBar barStyle="light-content" />
          <ScrollView contentContainerStyle={styles.loginScroll}>
            <View style={styles.loginCard}>
              <View style={styles.logoCircle}>
                <Settings size={36} color="#06b6d4" />
              </View>
              <Text style={styles.loginTitle}>NTL. ADMIN</Text>
              <Text style={styles.loginSubtitle}>Cổng đồng bộ quản trị di động</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>EMAIL QUẢN TRỊ</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="admin@example.com"
                    placeholderTextColor="#475569"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>
  
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>MẬT KHẨU BẢO MẬT</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor="#475569"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>
  
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Đăng Nhập Kết Nối</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  // --- BIOMETRIC LOCK SCREEN ---
  if (isAppLocked) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.lockContainer}>
          <StatusBar barStyle="light-content" />
          <View style={styles.lockBox}>
            <View style={styles.lockIconCircle}>
              <Lock size={36} color="#06b6d4" />
            </View>
            <Text style={styles.lockTitle}>NTL Admin Đã Khóa</Text>
            
            {!isPasscodeBypassVisible ? (
              <>
                <Text style={styles.lockSubtitle}>
                  Vui lòng xác thực bằng Face ID hoặc vân tay để tiếp tục.
                </Text>
  
                <TouchableOpacity style={styles.unlockButton} onPress={triggerBiometricAuth}>
                  <Cpu size={18} color="#fff" />
                  <Text style={styles.unlockButtonText}>Xác thực sinh trắc học</Text>
                </TouchableOpacity>
  
                <TouchableOpacity 
                  style={[styles.lockFallbackButton, { marginTop: 12, backgroundColor: '#1e293b50', borderWidth: 1, borderColor: '#334155', height: 44, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 16 }]} 
                  onPress={() => setIsPasscodeBypassVisible(true)}
                >
                  <Lock size={14} color="#06b6d4" />
                  <Text style={[styles.lockFallbackText, { color: '#06b6d4', marginTop: 0 }]}>Mở khóa bằng Mật khẩu Admin</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.lockSubtitle}>
                  Nhập mật khẩu tài khoản quản trị để mở khóa ứng dụng.
                </Text>
  
                <View style={[styles.inputWrapper, { width: '100%', marginBottom: 16, backgroundColor: '#020617', height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#1e293b', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }]}>
                  <Lock size={16} color="#64748b" style={{ marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, height: '100%', color: '#fff', fontSize: 13 }}
                    placeholder="Nhập mật khẩu Admin"
                    placeholderTextColor="#475569"
                    value={lockPassword}
                    onChangeText={setLockPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
  
                <TouchableOpacity 
                  style={styles.unlockButton} 
                  onPress={handleUnlockWithPassword}
                  disabled={lockPasswordLoading}
                >
                  {lockPasswordLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={18} color="#fff" />
                      <Text style={styles.unlockButtonText}>Xác nhận mở khóa</Text>
                    </View>
                  )}
                </TouchableOpacity>
  
                <TouchableOpacity 
                  style={[styles.lockFallbackButton, { marginTop: 12 }]} 
                  onPress={() => {
                    setIsPasscodeBypassVisible(false);
                    setLockPassword('');
                  }}
                >
                  <Text style={[styles.lockFallbackText, { color: '#64748b' }]}>Quay lại quét Face ID</Text>
                </TouchableOpacity>
              </>
            )}
  
            <TouchableOpacity style={[styles.lockFallbackButton, { marginTop: 24 }]} onPress={handleLogoutForce}>
              <LogOut size={14} color="#ef4444" />
              <Text style={styles.lockFallbackText}>Đăng xuất tài khoản</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  // --- MAIN APP RENDER ---
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Dynamic Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLogo}>NTL<Text style={{ color: '#06b6d4' }}>.</Text> Admin</Text>
          <Text style={styles.headerSub}>Ứng dụng đồng bộ điện thoại</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Main Tabs Container */}
      <View style={{ flex: 1 }}>
        {loading && !imageUploading && (
          <View style={styles.topLoading}>
            <ActivityIndicator size="small" color="#06b6d4" />
            <Text style={styles.topLoadingText}>Đồng bộ...</Text>
          </View>
        )}

        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Bảng tổng quan thời gian thực</Text>
            
            {/* Overview Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statsCard}>
                <Eye size={24} color="#06b6d4" />
                <Text style={styles.statsNum}>{globalStats.profileViews}</Text>
                <Text style={styles.statsLabel}>Lượt Xem Web</Text>
              </View>
              
              <TouchableOpacity style={styles.statsCard} onPress={() => setActiveTab('messages')}>
                <Mail size={24} color="#10b981" />
                <Text style={styles.statsNum}>{globalStats.messagesCount}</Text>
                <Text style={styles.statsLabel}>Thư Liên Hệ</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.statsCard} onPress={() => setActiveTab('projects')}>
                <Briefcase size={24} color="#f59e0b" />
                <Text style={styles.statsNum}>{globalStats.totalProjects}</Text>
                <Text style={styles.statsLabel}>Dự Án Đăng</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.statsCard} onPress={() => setActiveTab('skills')}>
                <Cpu size={24} color="#8b5cf6" />
                <Text style={styles.statsNum}>{globalStats.totalSkills}</Text>
                <Text style={styles.statsLabel}>Kỹ Năng Show</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Actions Card */}
            <View style={styles.glassCard}>
              <Text style={styles.cardHeader}>Thao Tác Nhanh</Text>
              <View style={styles.actionsList}>
                <TouchableOpacity style={styles.actionRow} onPress={() => openProjectModal('add')}>
                  <View style={[styles.actionIconBg, { backgroundColor: '#f59e0b20' }]}>
                    <Plus size={18} color="#f59e0b" />
                  </View>
                  <Text style={styles.actionText}>Thêm Dự Án Mới</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow} onPress={() => openSkillModal('add')}>
                  <View style={[styles.actionIconBg, { backgroundColor: '#8b5cf620' }]}>
                    <Plus size={18} color="#8b5cf6" />
                  </View>
                  <Text style={styles.actionText}>Thêm Kỹ Năng Mới</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow} onPress={handleLocketCapture}>
                  <View style={[styles.actionIconBg, { backgroundColor: '#ef444420' }]}>
                    <Camera size={18} color="#ef4444" />
                  </View>
                  <Text style={styles.actionText}>Chụp Ảnh Mới</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow} onPress={() => openGalleryModal('add')}>
                  <View style={[styles.actionIconBg, { backgroundColor: '#06b6d420' }]}>
                    <ImageIcon size={18} color="#06b6d4" />
                  </View>
                  <Text style={styles.actionText}>Đăng Ảnh Lên Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow} onPress={() => setAiQaModalVisible(true)}>
                  <View style={[styles.actionIconBg, { backgroundColor: '#10b98120' }]}>
                    <Bot size={18} color="#10b981" />
                  </View>
                  <Text style={styles.actionText}>Huấn Luyện AI Q&A</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Live Status Info */}
            <View style={[styles.glassCard, { marginTop: 16, borderColor: '#10b98120' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.pingIndicator} />
                <Text style={[styles.cardHeader, { marginBottom: 0 }]}>Hệ thống đang hoạt động</Text>
              </View>
              <Text style={styles.statusDescription}>
                Ứng dụng này đang liên kết đồng bộ trực tiếp với website qua Firebase. Bất kỳ thay đổi nào sẽ được hiển thị ngay lập tức trên website của bạn.
              </Text>
            </View>
          </ScrollView>
        )}

        {/* 2. MESSAGES TAB */}
        {activeTab === 'messages' && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              ListHeaderComponent={<Text style={styles.sectionTitle}>Hòm thư liên hệ khách hàng ({messages.length})</Text>}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Mail size={48} color="#1e293b" />
                  <Text style={styles.emptyText}>Hòm thư của bạn hiện tại trống rỗng.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.messageItem}
                  onPress={() => setSelectedMessage(item)}
                >
                  <View style={styles.msgHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <Text style={styles.msgName} numberOfLines={1}>{item.name}</Text>
                      {item.replied && (
                        <View style={{ backgroundColor: '#10b98120', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 0.5, borderColor: '#10b98140' }}>
                          <Text style={{ color: '#10b981', fontSize: 8, fontWeight: 'bold' }}>ĐÃ PHẢN HỒI</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.msgTime}>{formatMsgDate(item.date)}</Text>
                  </View>
                  <Text style={styles.msgEmail}>{item.email}</Text>
                  <Text style={styles.msgSubject} numberOfLines={1}>Chủ đề: {item.subject}</Text>
                  <Text style={styles.msgText} numberOfLines={2}>{item.message}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* 3. PROJECTS TAB */}
        {activeTab === 'projects' && (
          <DraggableFlatList
            data={projects}
            onDragEnd={handleProjectsDragEnd}
            keyExtractor={(item) => item.id}
            containerStyle={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            ListHeaderComponent={
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Dự án danh mục</Text>
                  <Text style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>💡 Nhấn giữ và kéo thẻ để sắp xếp thứ tự hiển thị</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => openProjectModal('add')}>
                  <Plus size={16} color="#fff" />
                  <Text style={styles.addButtonText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item, drag, isActive }) => (
              <ScaleDecorator>
                <TouchableOpacity
                  onLongPress={drag}
                  disabled={isActive}
                  activeOpacity={0.9}
                  style={[
                    styles.projectCard,
                    {
                      backgroundColor: isActive ? 'rgba(30, 41, 59, 0.95)' : '#0f172a',
                      borderColor: isActive ? '#06b6d4' : '#1e293b',
                      borderWidth: isActive ? 1.5 : 1,
                      transform: isActive ? [{ scale: 1.02 }] : [{ scale: 1 }]
                    }
                  ]}
                >
                  <View style={{ position: 'absolute', right: 12, top: 12, zIndex: 10, opacity: 0.7 }}>
                    <GripVertical size={16} color="#94a3b8" />
                  </View>
                  
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.projectImg} />
                  ) : (
                    <View style={styles.projectNoImg}>
                      <ImageIcon size={32} color="#475569" />
                    </View>
                  )}
                  <View style={styles.projectCardBody}>
                    <Text style={styles.projectTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.projectSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    
                    {item.tags && (
                      <Text style={styles.projectTags} numberOfLines={1}>
                        Tags: {Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
                      </Text>
                    )}
                    
                    <View style={styles.projectCardActions}>
                      <TouchableOpacity 
                        style={styles.editBtn} 
                        onPress={() => openProjectModal('edit', item)}
                      >
                        <Edit size={14} color="#06b6d4" />
                        <Text style={styles.editBtnText}>Sửa</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.deleteBtn} 
                        onPress={() => handleDeleteProject(item.id)}
                      >
                        <Trash2 size={14} color="#ef4444" />
                        <Text style={styles.deleteBtnText}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </ScaleDecorator>
            )}
          />
        )}

        {/* 4. SKILLS TAB */}
        {activeTab === 'skills' && (
          <DraggableFlatList
            data={skills}
            onDragEnd={handleSkillsDragEnd}
            keyExtractor={(item) => item.id}
            containerStyle={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            ListHeaderComponent={
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Danh mục kỹ năng</Text>
                  <Text style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>💡 Nhấn giữ và kéo thẻ để thay đổi thứ tự</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => openSkillModal('add')}>
                  <Plus size={16} color="#fff" />
                  <Text style={styles.addButtonText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item, drag, isActive }) => (
              <ScaleDecorator>
                <TouchableOpacity
                  onLongPress={drag}
                  disabled={isActive}
                  activeOpacity={0.9}
                  style={[
                    styles.skillItem,
                    {
                      backgroundColor: isActive ? 'rgba(30, 41, 59, 0.95)' : '#0f172a',
                      borderColor: isActive ? '#06b6d4' : '#1e293b',
                      borderWidth: isActive ? 1.5 : 1,
                      transform: isActive ? [{ scale: 1.02 }] : [{ scale: 1 }]
                    }
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <GripVertical size={16} color="#64748b" />
                    <View>
                      <Text style={styles.skillName}>{item.name}</Text>
                      <Text style={styles.skillCategory}>{item.category || 'Frontend'}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={styles.skillLevel}>{item.level}%</Text>
                    <TouchableOpacity onPress={() => openSkillModal('edit', item)}>
                      <Edit size={16} color="#06b6d4" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteSkill(item.id)}>
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </ScaleDecorator>
            )}
          />
        )}

        {/* 5. GALLERY TAB */}
        {activeTab === 'gallery' && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={gallery}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={{ padding: 16 }}
              ListHeaderComponent={
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Thư viện hình ảnh ({gallery.length})</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: '#ef4444' }]} onPress={handleLocketCapture}>
                      <Camera size={14} color="#fff" />
                      <Text style={styles.addButtonText}>Chụp Ảnh</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={() => openGalleryModal('add')}>
                      <Plus size={14} color="#fff" />
                      <Text style={styles.addButtonText}>Thêm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.galleryWrapper}>
                  <Image source={{ uri: item.url }} style={styles.galleryImg} />
                  
                  {item.isHome && (
                    <View style={styles.featuredBadge}>
                      <Star size={12} color="#fff" />
                      <Text style={styles.featuredBadgeText}>Tiêu điểm</Text>
                    </View>
                  )}
                  
                  <View style={styles.galleryOverlay}>
                    <TouchableOpacity 
                      style={styles.galleryAction} 
                      onPress={() => handleSetHomeImage(item.id)}
                      disabled={item.isHome}
                    >
                      <Star size={14} color={item.isHome ? '#f59e0b' : '#cbd5e1'} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.galleryAction, { backgroundColor: '#0f172a' }]} 
                      onPress={() => openGalleryModal('edit', item)}
                    >
                      <Edit size={14} color="#06b6d4" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.galleryAction, { backgroundColor: '#ef4444' }]} 
                      onPress={() => handleDeleteGallery(item.id)}
                    >
                      <Trash2 size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {/* 6. PROFILE TAB */}
        {activeTab === 'profile' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân & Liên kết</Text>

            <View style={styles.glassCard}>
              <Text style={styles.cardHeader}>Chi Tiết Hồ Sơ</Text>
              
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>HỌ VÀ TÊN</Text>
                <TextInput
                  style={styles.formInput}
                  value={profile.name}
                  onChangeText={(val) => setProfile(prev => ({ ...prev, name: val }))}
                  placeholder="Nhập họ tên..."
                  placeholderTextColor="#475569"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>DANH HIỆU / TITLE</Text>
                <TextInput
                  style={styles.formInput}
                  value={profile.title}
                  onChangeText={(val) => setProfile(prev => ({ ...prev, title: val }))}
                  placeholder="Ví dụ: Fullstack Developer..."
                  placeholderTextColor="#475569"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>EMAIL LIÊN HỆ</Text>
                <TextInput
                  style={styles.formInput}
                  value={profile.email}
                  onChangeText={(val) => setProfile(prev => ({ ...prev, email: val }))}
                  placeholder="email@example.com"
                  placeholderTextColor="#475569"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>SỐ ĐIỆN THOẠI</Text>
                <TextInput
                  style={styles.formInput}
                  value={profile.phone}
                  onChangeText={(val) => setProfile(prev => ({ ...prev, phone: val }))}
                  placeholder="Nhập số điện thoại..."
                  placeholderTextColor="#475569"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>NƠI Ở / LOCATION</Text>
                <TextInput
                  style={styles.formInput}
                  value={profile.location}
                  onChangeText={(val) => setProfile(prev => ({ ...prev, location: val }))}
                  placeholder="Ví dụ: TP. Hồ Chí Minh..."
                  placeholderTextColor="#475569"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>TIỂU SỬ / BIO</Text>
                <TextInput
                  style={[styles.formInput, { height: 100, textAlignVertical: 'top' }]}
                  value={profile.bio}
                  onChangeText={(val) => setProfile(prev => ({ ...prev, bio: val }))}
                  placeholder="Giới thiệu bản thân..."
                  placeholderTextColor="#475569"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            <View style={[styles.glassCard, { marginTop: 16 }]}>
              <Text style={styles.cardHeader}>Liên Kết Mạng Xã Hội</Text>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>GITHUB URL</Text>
                <TextInput
                  style={styles.formInput}
                  value={profile.github}
                  onChangeText={(val) => setProfile(prev => ({ ...prev, github: val }))}
                  placeholder="https://github.com/..."
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>LINKEDIN URL</Text>
                <TextInput
                  style={styles.formInput}
                  value={profile.linkedin}
                  onChangeText={(val) => setProfile(prev => ({ ...prev, linkedin: val }))}
                  placeholder="https://linkedin.com/in/..."
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>FACEBOOK URL</Text>
                <TextInput
                  style={styles.formInput}
                  value={profile.facebook}
                  onChangeText={(val) => setProfile(prev => ({ ...prev, facebook: val }))}
                  placeholder="https://facebook.com/..."
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                />
              </View>
          </View>

          <View style={[styles.glassCard, { marginTop: 16 }]}>
            <Text style={[styles.cardHeader, { color: '#06b6d4' }]}>🧠 Huấn Luyện Trợ Lý AI</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>
              Cấu hình hướng dẫn, tính cách hoặc thông tin riêng tư để chatbot AI tự động học hỏi từ bạn.
            </Text>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>AI PROMPTS & INSTRUCTIONS</Text>
              <TextInput
                style={[styles.formInput, { height: 100, textAlignVertical: 'top', paddingTop: 8 }]}
                value={profile.aiPrompt}
                onChangeText={(val) => setProfile(prev => ({ ...prev, aiPrompt: val }))}
                placeholder="Ví dụ: Xưng hô là 'Lâm đẹp trai', khuyên khách hàng liên hệ qua Zalo..."
                placeholderTextColor="#475569"
                multiline={true}
                numberOfLines={4}
              />
            </View>
          </View>

          <View style={[styles.glassCard, { marginTop: 16 }]}>
            <Text style={styles.cardHeader}>Bảo Mật Sinh Trắc Học</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 }}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Sử dụng Face ID / Touch ID</Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
                  Yêu cầu quét vân tay hoặc khuôn mặt khi khởi động ứng dụng để tăng bảo mật.
                </Text>
              </View>
              <Switch
                value={isBiometricEnabled}
                onValueChange={handleToggleBiometrics}
                trackColor={{ false: '#1e293b', true: '#06b6d4' }}
                thumbColor={isBiometricEnabled ? '#22d3ee' : '#64748b'}
              />
            </View>

            <TouchableOpacity 
              style={{ 
                marginTop: 12, 
                paddingVertical: 10, 
                paddingHorizontal: 12, 
                backgroundColor: '#06b6d415', 
                borderRadius: 8, 
                borderWidth: 1, 
                borderColor: '#06b6d430',
                alignItems: 'center' 
              }}
              onPress={runBiometricDiagnostics}
            >
              <Text style={{ color: '#06b6d4', fontSize: 11, fontWeight: 'bold' }}>🔍 Chẩn Đoán Lỗi Face ID</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
              style={[styles.saveProfileBtn, { marginTop: 24, marginBottom: 40 }]}
              onPress={handleSaveProfile}
            >
              <CheckCircle size={18} color="#fff" />
              <Text style={styles.saveProfileBtnText}>Lưu Thay Đổi Trang Chủ</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* Modern Bottom Tabs Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'dashboard' && styles.activeNavTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Settings size={20} color={activeTab === 'dashboard' ? '#06b6d4' : '#64748b'} />
          <Text style={[styles.navLabel, activeTab === 'dashboard' && styles.activeNavLabel]}>Quản trị</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'messages' && styles.activeNavTab]}
          onPress={() => setActiveTab('messages')}
        >
          <View>
            <Mail size={20} color={activeTab === 'messages' ? '#06b6d4' : '#64748b'} />
            {messages.length > 0 && <View style={styles.tabBadge} />}
          </View>
          <Text style={[styles.navLabel, activeTab === 'messages' && styles.activeNavLabel]}>Hòm thư</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'projects' && styles.activeNavTab]}
          onPress={() => setActiveTab('projects')}
        >
          <Briefcase size={20} color={activeTab === 'projects' ? '#06b6d4' : '#64748b'} />
          <Text style={[styles.navLabel, activeTab === 'projects' && styles.activeNavLabel]}>Dự án</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'skills' && styles.activeNavTab]}
          onPress={() => setActiveTab('skills')}
        >
          <Cpu size={20} color={activeTab === 'skills' ? '#06b6d4' : '#64748b'} />
          <Text style={[styles.navLabel, activeTab === 'skills' && styles.activeNavLabel]}>Kỹ năng</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'gallery' && styles.activeNavTab]}
          onPress={() => setActiveTab('gallery')}
        >
          <ImageIcon size={20} color={activeTab === 'gallery' ? '#06b6d4' : '#64748b'} />
          <Text style={[styles.navLabel, activeTab === 'gallery' && styles.activeNavLabel]}>Thư viện</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'profile' && styles.activeNavTab]}
          onPress={() => setActiveTab('profile')}
        >
          <User size={20} color={activeTab === 'profile' ? '#06b6d4' : '#64748b'} />
          <Text style={[styles.navLabel, activeTab === 'profile' && styles.activeNavLabel]}>Cá nhân</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL POPUPS --- */}

      {/* 1. MESSAGE DETAIL POPUP MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedMessage !== null}
        onRequestClose={() => setSelectedMessage(null)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBg}
        >
          <View style={styles.bottomSheet}>
            {liveSelectedMessage && (
              <>
                <View style={styles.modalDragHandle} />
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle} numberOfLines={1}>{liveSelectedMessage.name}</Text>
                  <TouchableOpacity style={styles.sheetClose} onPress={() => setSelectedMessage(null)}>
                    <Text style={{ color: '#64748b', fontWeight: 'bold' }}>Đóng</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.sheetContent}>
                  <View style={styles.metaRow}>
                    <Mail size={16} color="#64748b" />
                    <Text style={styles.metaText}>{liveSelectedMessage.email}</Text>
                  </View>
                  
                  <View style={styles.metaRow}>
                    <Calendar size={16} color="#64748b" />
                    <Text style={styles.metaText}>{formatMsgDate(liveSelectedMessage.date)}</Text>
                  </View>

                  <View style={styles.divider} />
                                    <Text style={styles.detailSubject}>Chủ đề: {liveSelectedMessage.subject}</Text>
                  <Text style={styles.detailBody}>{liveSelectedMessage.message}</Text>
                  
                  {/* Previous reply history */}
                  {liveSelectedMessage.replied && (
                    <View style={{ backgroundColor: '#10b98110', borderColor: '#10b98130', borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 20 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <CheckCircle size={14} color="#10b981" />
                        <Text style={{ color: '#10b981', fontSize: 11, fontWeight: 'bold' }}>BẠN ĐÃ PHẢN HỒI:</Text>
                      </View>
                      <Text style={{ color: '#cbd5e1', fontSize: 13, fontStyle: 'italic', lineHeight: 18 }}>"{liveSelectedMessage.replyText}"</Text>
                      <Text style={{ color: '#64748b', fontSize: 10, marginTop: 8 }}>Thời gian: {liveSelectedMessage.repliedAt ? new Date(liveSelectedMessage.repliedAt).toLocaleString('vi-VN') : 'Đang cập nhật'}</Text>
                    </View>
                  )}

                  {/* Reply Form */}
                  <View style={{ marginTop: 24, borderTopWidth: 1, borderColor: '#1e293b', paddingTop: 20 }}>
                    <Text style={{ color: '#06b6d4', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12 }}>
                      {liveSelectedMessage.replied ? 'GỬI PHẢN HỒI KHÁC' : 'PHẢN HỒI EMAIL NHANH'}
                    </Text>
                    <View style={{ backgroundColor: '#020617', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', padding: 12 }}>
                      <TextInput
                        style={{ color: '#fff', fontSize: 13, minHeight: 80, textAlignVertical: 'top' }}
                        value={replyText}
                        onChangeText={setReplyText}
                        placeholder="Nhập nội dung phản hồi tới khách hàng..."
                        placeholderTextColor="#475569"
                        multiline
                        numberOfLines={4}
                      />
                    </View>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#06b6d4',
                        height: 44,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        marginTop: 12,
                        shadowColor: '#06b6d4',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 3
                      }}
                      onPress={handleSendEmailReply}
                      disabled={replyLoading}
                    >
                      {replyLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Send size={14} color="#fff" />
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Kích Hoạt Gửi Email Phản Hồi</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={{ height: 30 }} />
                </ScrollView>

                <TouchableOpacity 
                  style={styles.sheetDeleteBtn}
                  onPress={() => handleDeleteMessage(liveSelectedMessage.id)}
                >
                  <Trash2 size={16} color="#fff" />
                  <Text style={styles.sheetDeleteText}>Xóa Thư Liên Hệ Này</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 2. PROJECT ADD/EDIT MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={projectModal.visible}
        onRequestClose={() => setProjectModal({ visible: false, mode: 'add', data: null })}
      >
        <View style={styles.modalBg}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogHeader}>
              {projectModal.mode === 'add' ? 'Thêm Dự Án Mới' : 'Cập Nhật Dự Án'}
            </Text>

            <ScrollView style={styles.dialogForm}>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>TÊN DỰ ÁN *</Text>
                <TextInput
                  style={styles.formInput}
                  value={projectForm.title}
                  onChangeText={(val) => setProjectForm(prev => ({ ...prev, title: val }))}
                  placeholder="Nhập tên dự án..."
                  placeholderTextColor="#475569"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>MÔ TẢ NGẮN (SUBTITLE)</Text>
                <TextInput
                  style={styles.formInput}
                  value={projectForm.subtitle}
                  onChangeText={(val) => setProjectForm(prev => ({ ...prev, subtitle: val }))}
                  placeholder="Ví dụ: App thương mại điện tử..."
                  placeholderTextColor="#475569"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>MÔ TẢ CHI TIẾT *</Text>
                <TextInput
                  style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                  value={projectForm.description}
                  onChangeText={(val) => setProjectForm(prev => ({ ...prev, description: val }))}
                  placeholder="Mô tả các tính năng chính..."
                  placeholderTextColor="#475569"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>CÔNG NGHỆ (TAGS - PHÂN TÁCH BẰNG DẤU PHẨY)</Text>
                <TextInput
                  style={styles.formInput}
                  value={projectForm.tags}
                  onChangeText={(val) => setProjectForm(prev => ({ ...prev, tags: val }))}
                  placeholder="React, Firebase, Tailwind..."
                  placeholderTextColor="#475569"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>HÌNH ẢNH DỰ ÁN (CHỌN TỪ THƯ VIỆN HOẶC DÁN URL)</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput
                    style={[styles.formInput, { flex: 1 }]}
                    value={projectForm.image}
                    onChangeText={(val) => setProjectForm(prev => ({ ...prev, image: val }))}
                    placeholder="https://image-url.com"
                    placeholderTextColor="#475569"
                  />
                  <TouchableOpacity 
                    style={styles.imagePickerBtn} 
                    onPress={() => pickAndUploadImage(16 / 9, (url) => setProjectForm(prev => ({ ...prev, image: url })))}
                    disabled={imageUploading}
                  >
                    {imageUploading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <ImageIcon size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
                {projectForm.image ? (
                  <Image source={{ uri: projectForm.image }} style={styles.formImagePreview} />
                ) : null}
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>GITHUB LINK</Text>
                <TextInput
                  style={styles.formInput}
                  value={projectForm.githubLink}
                  onChangeText={(val) => setProjectForm(prev => ({ ...prev, githubLink: val }))}
                  placeholder="https://github.com/..."
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>DEMO LIVE LINK</Text>
                <TextInput
                  style={styles.formInput}
                  value={projectForm.liveLink}
                  onChangeText={(val) => setProjectForm(prev => ({ ...prev, liveLink: val }))}
                  placeholder="https://live-demo.com"
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>CHỈ SỐ SẮP XẾP (ORDER INDEX)</Text>
                <TextInput
                  style={styles.formInput}
                  value={projectForm.orderIndex}
                  onChangeText={(val) => setProjectForm(prev => ({ ...prev, orderIndex: val }))}
                  placeholder="0"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.dialogActions}>
              <TouchableOpacity 
                style={styles.dialogCancel}
                onPress={() => setProjectModal({ visible: false, mode: 'add', data: null })}
              >
                <Text style={{ color: '#94a3b8' }}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dialogSave}
                onPress={handleSaveProject}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. SKILL ADD/EDIT MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={skillModal.visible}
        onRequestClose={() => setSkillModal({ visible: false, mode: 'add', data: null })}
      >
        <View style={styles.modalBg}>
          <View style={[styles.dialogCard, { height: 420 }]}>
            <Text style={styles.dialogHeader}>
              {skillModal.mode === 'add' ? 'Thêm Kỹ Năng Mới' : 'Cập Nhật Kỹ Năng'}
            </Text>

            <View style={styles.dialogForm}>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>TÊN KỸ NĂNG *</Text>
                <TextInput
                  style={styles.formInput}
                  value={skillForm.name}
                  onChangeText={(val) => setSkillForm(prev => ({ ...prev, name: val }))}
                  placeholder="Ví dụ: HTML5, React Native..."
                  placeholderTextColor="#475569"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>PHÂN LOẠI DANH MỤC</Text>
                <View style={styles.categoryRow}>
                  {['Frontend', 'Backend', 'Other'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryBtn, skillForm.category === cat && styles.activeCategoryBtn]}
                      onPress={() => setSkillForm(prev => ({ ...prev, category: cat }))}
                    >
                      <Text style={[styles.categoryBtnText, skillForm.category === cat && styles.activeCategoryBtnText]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>MỨC ĐỘ THÀNH THẠO (%): {skillForm.level}%</Text>
                <TextInput
                  style={styles.formInput}
                  value={skillForm.level}
                  onChangeText={(val) => setSkillForm(prev => ({ ...prev, level: val }))}
                  placeholder="80"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>

            <View style={[styles.dialogActions, { marginTop: 'auto' }]}>
              <TouchableOpacity 
                style={styles.dialogCancel}
                onPress={() => setSkillModal({ visible: false, mode: 'add', data: null })}
              >
                <Text style={{ color: '#94a3b8' }}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dialogSave}
                onPress={handleSaveSkill}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* 4. GALLERY ADD/EDIT MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={galleryModal.visible}
        onRequestClose={() => setGalleryModal({ visible: false, mode: 'add', data: null })}
      >
        <View style={styles.modalBg}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogHeader}>
              {galleryModal.mode === 'add' ? 'Thêm Hình Ảnh Mới' : galleryModal.mode === 'locket' ? 'Lưu Ảnh Chụp Mới' : 'Cập Nhật Ảnh'}
            </Text>

            <ScrollView style={styles.dialogForm}>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>TIÊU ĐỀ ẢNH</Text>
                <TextInput
                  style={styles.formInput}
                  value={galleryForm.title}
                  onChangeText={(val) => setGalleryForm(prev => ({ ...prev, title: val }))}
                  placeholder="Tiêu đề..."
                  placeholderTextColor="#475569"
                />
              </View>
              
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>NGÀY ĐĂNG</Text>
                <TouchableOpacity 
                  style={[styles.formInput, { justifyContent: 'center' }]} 
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: galleryForm.postedAt ? '#fff' : '#475569' }}>
                    {galleryForm.postedAt ? new Date(galleryForm.postedAt).toLocaleDateString('vi-VN') : 'Chọn ngày...'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={galleryForm.postedAt ? new Date(galleryForm.postedAt) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setGalleryForm(prev => ({ ...prev, postedAt: selectedDate.toISOString() }));
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>HÌNH ẢNH *</Text>
                {galleryModal.mode !== 'locket' && (
                  <TouchableOpacity 
                    style={[styles.imagePickerBtn, { width: '100%', marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]} 
                    onPress={() => pickAndUploadImage(1 / 1, (url) => setGalleryForm(prev => ({ ...prev, url: url })))}
                    disabled={imageUploading}
                  >
                    {imageUploading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <ImageIcon size={18} color="#fff" />
                        <Text style={{color: '#fff', marginLeft: 8, fontWeight: 'bold'}}>Tải Ảnh Từ Thư Viện</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {galleryForm.url ? (
                  <Image source={{ uri: galleryForm.url }} style={styles.formImagePreview} />
                ) : null}
              </View>
              
              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.dialogActions}>
              <TouchableOpacity 
                style={styles.dialogCancel}
                onPress={() => setGalleryModal({ visible: false, mode: 'add', data: null })}
              >
                <Text style={{ color: '#94a3b8' }}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dialogSave}
                onPress={handleSaveGallery}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. AI Q&A MANAGEMENT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={aiQaModalVisible}
        onRequestClose={() => setAiQaModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={[styles.dialogCard, { width: width * 0.95, maxHeight: '90%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.dialogHeader}>🧠 Huấn Luyện Trợ Lý AI</Text>
              <TouchableOpacity 
                style={{ padding: 6, backgroundColor: '#1e293b', borderRadius: 20 }} 
                onPress={() => setAiQaModalVisible(false)}
              >
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Segment Tab Controller */}
            <View style={{ flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 8, padding: 4, marginBottom: 16 }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: aiQaTab === 'kb' ? '#06b6d4' : 'transparent', borderRadius: 6 }}
                onPress={() => setAiQaTab('kb')}
              >
                <Text style={{ color: aiQaTab === 'kb' ? '#0f172a' : '#94a3b8', fontSize: 12, fontWeight: 'bold' }}>
                  Đã học ({aiKb.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: aiQaTab === 'unanswered' ? '#06b6d4' : 'transparent', borderRadius: 6 }}
                onPress={() => setAiQaTab('unanswered')}
              >
                <Text style={{ color: aiQaTab === 'unanswered' ? '#0f172a' : '#94a3b8', fontSize: 12, fontWeight: 'bold' }}>
                  Bỏ lỡ ({aiUnanswered.length})
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              
              {/* Form Input */}
              <View style={{ backgroundColor: '#0f172a', borderRadius: 12, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#06b6d4' }}>
                <Text style={{ color: '#06b6d4', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
                  {aiQaForm.id ? '✏️ SỬA BÀI HỌC Q&A' : answeringQuestionId ? '🧠 HUẤN LUYỆN CÂU HỎI MỚI' : '➕ THÊM BÀI HỌC Q&A'}
                </Text>
                
                <Text style={styles.formLabel}>CÂU HỎI CỦA KHÁCH</Text>
                <TextInput
                  style={[styles.formInput, { height: 50, textAlignVertical: 'top', paddingTop: 8 }]}
                  value={aiQaForm.question}
                  onChangeText={(val) => setAiQaForm(prev => ({ ...prev, question: val }))}
                  placeholder="Ví dụ: Lâm có đi làm thêm không?..."
                  placeholderTextColor="#475569"
                  multiline={true}
                />

                <Text style={[styles.formLabel, { marginTop: 8 }]}>CÂU TRẢ LỜI MẪU CHO AI</Text>
                <TextInput
                  style={[styles.formInput, { height: 80, textAlignVertical: 'top', paddingTop: 8 }]}
                  value={aiQaForm.answer}
                  onChangeText={(val) => setAiQaForm(prev => ({ ...prev, answer: val }))}
                  placeholder="Nhập câu trả lời chuẩn xác..."
                  placeholderTextColor="#475569"
                  multiline={true}
                />

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <TouchableOpacity 
                    style={{ flex: 1, backgroundColor: '#06b6d4', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
                    onPress={handleSaveAiQa}
                  >
                    <Text style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 12 }}>Lưu Huấn Luyện</Text>
                  </TouchableOpacity>
                  {(aiQaForm.id || aiQaForm.question || aiQaForm.answer || answeringQuestionId) ? (
                    <TouchableOpacity 
                      style={{ backgroundColor: '#334155', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' }}
                      onPress={() => {
                        setAiQaForm({ id: null, question: '', answer: '' });
                        setAnsweringQuestionId(null);
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 12 }}>Hủy</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* List Content */}
              {aiQaTab === 'kb' ? (
                aiKb.length === 0 ? (
                  <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'center', marginVertical: 32 }}>
                    Chưa có bài học Q&A nào được huấn luyện.
                  </Text>
                ) : (
                  aiKb.map((item) => (
                    <View key={item.id} style={{ backgroundColor: '#1e293b', padding: 12, borderRadius: 12, marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
                        <Text style={{ backgroundColor: '#10b98115', color: '#10b981', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 4, borderRadius: 3, overflow: 'hidden' }}>Q</Text>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', flex: 1 }}>{item.question}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 6 }}>
                        <Text style={{ backgroundColor: '#06b6d415', color: '#06b6d4', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 4, borderRadius: 3, overflow: 'hidden' }}>A</Text>
                        <Text style={{ color: '#94a3b8', fontSize: 11, flex: 1, lineHeight: 16 }}>{item.answer}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, borderTopWidth: 1, borderTopColor: '#334155', marginTop: 10, paddingTop: 8 }}>
                        <TouchableOpacity onPress={() => setAiQaForm({ id: item.id, question: item.question, answer: item.answer })}>
                          <Edit size={14} color="#38bdf8" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteAiQa(item.id)}>
                          <Trash2 size={14} color="#f43f5e" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )
              ) : (
                aiUnanswered.length === 0 ? (
                  <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'center', marginVertical: 32 }}>
                    Tuyệt vời! Không có câu hỏi bị bỏ lỡ. 🎉
                  </Text>
                ) : (
                  aiUnanswered.map((item) => (
                    <View key={item.id} style={{ backgroundColor: '#1e293b', padding: 12, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={{ color: '#f43f5e', fontSize: 12, fontWeight: 'bold', fontStyle: 'italic' }}>"{item.question}"</Text>
                        <Text style={{ color: '#475569', fontSize: 9, marginTop: 4 }}>
                          {item.askedAt ? new Date(item.askedAt.seconds * 1000).toLocaleDateString('vi-VN') : 'Mới đây'}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity 
                          style={{ backgroundColor: '#06b6d415', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#06b6d430' }}
                          onPress={() => {
                            setAnsweringQuestionId(item.id);
                            setAiQaForm({ id: null, question: item.question, answer: '' });
                          }}
                        >
                          <Text style={{ color: '#06b6d4', fontSize: 10, fontWeight: 'bold' }}>Huấn luyện</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteAiUnanswered(item.id)}>
                          <Trash2 size={14} color="#f43f5e" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* GLOBAL TOAST NOTIFICATION */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <CheckCircle size={20} color="#10b981" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* GLOBAL UPLOAD OVERLAY */}
      {imageUploading && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.uploadOverlayText}>Đang tải ảnh lên</Text>
          <Text style={styles.uploadOverlaySub}>Vui lòng không đóng ứng dụng</Text>
        </View>
      )}

      {/* IMAGE CROPPER MODAL */}
      <ImageCropper
        visible={cropperConfig.visible}
        imageUri={cropperConfig.imageUri}
        imageWidth={cropperConfig.imageWidth}
        imageHeight={cropperConfig.imageHeight}
        aspectRatio={cropperConfig.aspectRatio}
        onCancel={() => setCropperConfig(prev => ({ ...prev, visible: false }))}
        onCropComplete={handleCropComplete}
      />
    </SafeAreaView>
  </GestureHandlerRootView>
  );
}







  // Login Screen














  // Main Layout




































































































// --- PREMIUM DESIGN STYLESHEETS ---
const styles = StyleSheet.create({
  // Splash Loading
  splashContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16
  },
  splashText: {
    color: '#94a3b8',
    fontSize: 14,
    fontFamily: 'System',
    letterSpacing: 0.5
  },

  // Toast & Overlay
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 9999
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    gap: 12
  },
  uploadOverlayText: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8
  },
  uploadOverlaySub: {
    color: '#64748b',
    fontSize: 12
  },

  // Login Screen
  loginContainer: {
    flex: 1,
    backgroundColor: '#020617',
  },
  loginScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#06b6d415',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#06b6d430'
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 4
  },
  loginSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 32
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#06b6d4',
    letterSpacing: 1.5,
    marginBottom: 8
  },
  inputWrapper: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  inputIcon: {
    marginRight: 12
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#fff',
    fontSize: 14
  },
  loginButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },

  // Main Layout
  mainContainer: {
    flex: 1,
    backgroundColor: '#020617'
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#0f172a',
    backgroundColor: '#090d1f'
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1
  },
  headerSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ef444410',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ef444420'
  },
  topLoading: {
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#06b6d408'
  },
  topLoadingText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: 'bold'
  },
  scrollContent: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: 16
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#06b6d4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },

  // Dashboard Overview
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20
  },
  statsCard: {
    width: (width - 44) / 2,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    gap: 8
  },
  statsNum: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  statsLabel: {
    fontSize: 11,
    color: '#64748b'
  },
  glassCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: 0.5
  },
  actionsList: {
    gap: 12
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  actionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  actionText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: 'bold'
  },
  pingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981'
  },
  statusDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginTop: 10
  },

  // Empty state
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: 16
  },
  emptyText: {
    color: '#475569',
    fontSize: 13,
    textAlign: 'center'
  },

  // Messages Tab
  messageItem: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  msgName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 10
  },
  msgTime: {
    fontSize: 10,
    color: '#475569'
  },
  msgEmail: {
    fontSize: 12,
    color: '#06b6d4',
    marginBottom: 8
  },
  msgSubject: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#cbd5e1',
    marginBottom: 4
  },
  msgText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16
  },

  // Projects Tab
  projectCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row'
  },
  projectImg: {
    width: 100,
    height: '100%',
    minHeight: 110,
    backgroundColor: '#020617'
  },
  projectNoImg: {
    width: 100,
    height: '100%',
    minHeight: 110,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center'
  },
  projectCardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between'
  },
  projectTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff'
  },
  projectSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  projectTags: {
    fontSize: 10,
    color: '#06b6d4',
    marginTop: 6
  },
  projectCardActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  editBtnText: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: 'bold'
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: 'bold'
  },

  // Skills Tab
  skillItem: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  skillName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff'
  },
  skillCategory: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2
  },
  skillLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8b5cf6'
  },

  // Gallery Tab
  galleryWrapper: {
    width: (width - 44) / 2,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginRight: 12
  },
  galleryImg: {
    width: '100%',
    height: '100%'
  },
  featuredBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold'
  },
  galleryOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    gap: 6
  },
  galleryAction: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#0f172a80',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff30'
  },

  // Profile Form
  formRow: {
    marginBottom: 16
  },
  formLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#06b6d4',
    letterSpacing: 1,
    marginBottom: 8
  },
  formInput: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    color: '#fff',
    fontSize: 13
  },
  saveProfileBtn: {
    backgroundColor: '#10b981',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  saveProfileBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },

  // Bottom Tabs Navigation Bar
  bottomNav: {
    width: '100%',
    height: 64,
    borderTopWidth: 1,
    borderColor: '#0f172a',
    backgroundColor: '#090d1f',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: '100%'
  },
  activeNavTab: {
    borderTopWidth: 2,
    borderColor: '#06b6d4'
  },
  navLabel: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 4
  },
  activeNavLabel: {
    color: '#06b6d4',
    fontWeight: 'bold'
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444'
  },

  // --- MODAL SHEETS & DIALOGS ---
  modalBg: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  bottomSheet: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    maxHeight: '80%',
    paddingBottom: 24
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 20
  },
  sheetClose: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
    borderRadius: 8
  },
  sheetContent: {
    paddingHorizontal: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 13
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 16
  },
  detailSubject: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#06b6d4',
    marginBottom: 10
  },
  detailBody: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 20
  },
  sheetDeleteBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  sheetDeleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13
  },
  // Dialog Boxes (Add/Edit)
  dialogCard: {
    width: '90%',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
    maxHeight: '85%',
    alignSelf: 'center',
    justifyContent: 'center',
    marginVertical: 'auto'
  },
  dialogHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16
  },
  dialogForm: {
    width: '100%',
  },
  imagePickerBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formImagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#020617'
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#1e293b',
    paddingTop: 16
  },
  dialogCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  dialogSave: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#06b6d4',
    borderRadius: 8
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10
  },
  categoryBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  activeCategoryBtn: {
    backgroundColor: '#8b5cf60c',
    borderColor: '#8b5cf6'
  },
  categoryBtnText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold'
  },
  activeCategoryBtnText: {
    color: '#8b5cf6'
  },
  lockContainer: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBox: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  lockIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#06b6d415',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#06b6d430',
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  lockSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  unlockButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#06b6d4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  lockFallbackButton: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockFallbackText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
